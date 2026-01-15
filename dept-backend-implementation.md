# 部门管理后端实现方案

基于您提供的部门模型，以下是完整的后端实现方案，包括Controller、Service、DTO和Repository层。

## 1. 实体类 (Entity)

```typescript
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('dept')
export class Dept {

  @ApiProperty({ description: '主键ID' })
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @ApiProperty({ description: '部门名称' })
  @Column({ comment: '部门名称', length: 100 })
  deptName: string;

  @ApiProperty({ description: '部门编码' })
  @Column({ comment: '部门编码', unique: true, length: 50 })
  deptCode: string;

  @ApiProperty({ description: '父级部门ID，顶级部门为0' })
  @Column({ comment: '父级部门ID', default: 0 })
  parentId: number;

  @ApiProperty({ description: '部门负责人ID' })
  @Column({ comment: '部门负责人ID', nullable: true, length: 50 })
  leaderId: string;

  @ApiProperty({ description: '部门负责人姓名', required: false })
  @Column({ comment: '部门负责人姓名', nullable: true, length: 100 })
  leaderName: string;

  @ApiProperty({ description: '部门排序' })
  @Column({ comment: '部门排序', default: 0 })
  orderNum: number;

  @ApiProperty({ description: '部门状态', default: 1 })
  @Column({ comment: '部门状态', default: 1 }) // 1-正常 0-禁用
  status: number;

  @ApiProperty({ description: '部门描述', required: false })
  @Column({ comment: '部门描述', nullable: true, length: 200 })
  remark: string;

  @ApiProperty({ description: '创建时间' })
  @Column({ type: 'timestamp', comment: '创建时间', name: 'create_time', default: () => 'CURRENT_TIMESTAMP' })
  createTime: Date;

  @ApiProperty({ description: '更新时间' })
  @Column({ type: 'timestamp', comment: '更新时间', name: 'update_time', default: () => 'CURRENT_TIMESTAMP', update: true })
  updateTime: Date;

  @ApiProperty({ description: '创建人', required: false })
  @Column({ comment: '创建人', nullable: true, length: 50, name: 'create_by' })
  createBy: string;

  @ApiProperty({ description: '更新人', required: false })
  @Column({ comment: '更新人', nullable: true, length: 50, name: 'update_by' })
  updateBy: string;

  // 自关联：父级部门
  @ManyToOne(() => Dept, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parentId', referencedColumnName: 'id' })
  parent: Dept;

  // 自关联：子部门
  @OneToMany(() => Dept, (dept) => dept.parent)
  children: Dept[];
}
```

## 2. DTO类

```typescript
// dept.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional, Min, Max, IsIn } from 'class-validator';

export class CreateDeptDto {
  @ApiProperty({
    description: '部门名称',
    example: '技术部',
  })
  @IsNotEmpty({ message: '部门名称不能为空' })
  @IsString()
  deptName: string;

  @ApiProperty({
    description: '部门编码',
    example: 'tech',
  })
  @IsNotEmpty({ message: '部门编码不能为空' })
  @IsString()
  deptCode: string;

  @ApiProperty({
    description: '父级部门ID',
    example: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  parentId?: number;

  @ApiProperty({
    description: '部门负责人ID',
    required: false,
  })
  @IsOptional()
  @IsString()
  leaderId?: string;

  @ApiProperty({
    description: '部门负责人姓名',
    required: false,
  })
  @IsOptional()
  @IsString()
  leaderName?: string;

  @ApiProperty({
    description: '部门排序',
    example: 0,
  })
  @IsNumber()
  @Min(0)
  orderNum: number;

  @ApiProperty({
    description: '部门状态',
    example: 1,
  })
  @IsNumber()
  @IsIn([0, 1])
  status: number;

  @ApiProperty({
    description: '部门描述',
    required: false,
  })
  @IsOptional()
  @IsString()
  remark?: string;
}

export class UpdateDeptDto extends CreateDeptDto {
  @ApiProperty({
    description: '部门ID',
    example: 1,
  })
  @IsNumber()
  id: number;
}

export class QueryDeptDto {
  @ApiProperty({
    description: '页码',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @ApiProperty({
    description: '每页数量',
    example: 10,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  size?: number = 10;

  @ApiProperty({
    description: '部门名称',
    required: false,
  })
  @IsOptional()
  deptName?: string;

  @ApiProperty({
    description: '状态',
    required: false,
  })
  @IsOptional()
  status?: number;
}
```

## 3. Repository层

```typescript
// dept.repository.ts
import { EntityRepository, Repository } from 'typeorm';
import { Dept } from './entities/dept.entity';

@EntityRepository(Dept)
export class DeptRepository extends Repository<Dept> {
  
  /**
   * 根据父ID获取子部门列表
   */
  async findChildrenByParentId(parentId: number): Promise<Dept[]> {
    return this.find({
      where: { parentId, status: 1 },
      order: { orderNum: 'ASC' },
    });
  }

  /**
   * 获取部门树形结构
   */
  async getDeptTree(): Promise<Dept[]> {
    const depts = await this.find({
      order: { parentId: 'ASC', orderNum: 'ASC' },
    });

    // 构建树形结构
    const deptMap = new Map<number, Dept>();
    const rootDepts: Dept[] = [];

    // 先创建所有部门的映射
    depts.forEach(dept => {
      deptMap.set(dept.id, { ...dept, children: [] });
    });

    // 构建父子关系
    depts.forEach(dept => {
      const currentDept = deptMap.get(dept.id);
      if (dept.parentId === 0) {
        // 根部门
        rootDepts.push(currentDept);
      } else {
        // 子部门
        const parentDept = deptMap.get(dept.parentId);
        if (parentDept) {
          parentDept.children.push(currentDept);
        }
      }
    });

    return rootDepts;
  }

  /**
   * 检查部门编码是否已存在
   */
  async checkDeptCode(deptCode: string, id?: number): Promise<boolean> {
    const queryBuilder = this.createQueryBuilder('dept')
      .where('dept.deptCode = :deptCode', { deptCode });

    if (id) {
      queryBuilder.andWhere('dept.id != :id', { id });
    }

    const count = await queryBuilder.getCount();
    return count > 0;
  }
}
```

## 4. Service层

```typescript
// dept.service.ts
import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Dept } from './entities/dept.entity';
import { CreateDeptDto, UpdateDeptDto, QueryDeptDto } from './dto/dept.dto';

@Injectable()
export class DeptService {
  constructor(
    @InjectRepository(Dept)
    private deptRepository: Repository<Dept>,
  ) {}

  /**
   * 创建部门
   */
  async create(createDeptDto: CreateDeptDto): Promise<Dept> {
    // 检查部门编码是否已存在
    const isCodeExists = await this.checkDeptCode(createDeptDto.deptCode);
    if (isCodeExists) {
      throw new ConflictException('部门编码已存在');
    }

    // 检查父级部门是否存在
    if (createDeptDto.parentId && createDeptDto.parentId !== 0) {
      const parentDept = await this.findOne(createDeptDto.parentId);
      if (!parentDept) {
        throw new BadRequestException('父级部门不存在');
      }
    }

    const dept = this.deptRepository.create(createDeptDto);
    return await this.deptRepository.save(dept);
  }

  /**
   * 分页查询部门
   */
  async findAll(query: QueryDeptDto) {
    const { page = 1, size = 10, deptName, status } = query;
    
    const queryBuilder = this.deptRepository.createQueryBuilder('dept')
      .skip((page - 1) * size)
      .take(size)
      .orderBy('dept.parentId', 'ASC')
      .addOrderBy('dept.orderNum', 'ASC');

    if (deptName) {
      queryBuilder.andWhere('dept.deptName LIKE :deptName', { 
        deptName: `%${deptName}%` 
      });
    }

    if (status !== undefined) {
      queryBuilder.andWhere('dept.status = :status', { status });
    }

    const [list, total] = await queryBuilder.getManyAndCount();

    return {
      list,
      pagination: {
        page: page,
        size: size,
        total: total,
      },
    };
  }

  /**
   * 根据ID获取部门
   */
  async findOne(id: number): Promise<Dept> {
    const dept = await this.deptRepository.findOne({ where: { id } });
    if (!dept) {
      throw new NotFoundException(`部门ID ${id} 不存在`);
    }
    return dept;
  }

  /**
   * 更新部门
   */
  async update(id: number, updateDeptDto: UpdateDeptDto): Promise<Dept> {
    const { deptCode, parentId } = updateDeptDto;

    // 检查部门编码是否已存在（排除当前部门）
    const isCodeExists = await this.checkDeptCode(deptCode, id);
    if (isCodeExists) {
      throw new ConflictException('部门编码已存在');
    }

    // 检查父级部门是否存在
    if (parentId && parentId !== 0) {
      const parentDept = await this.findOne(parentId);
      if (!parentDept) {
        throw new BadRequestException('父级部门不存在');
      }
    }

    // 检查是否尝试将部门设置为其自身的子部门
    if (parentId) {
      const isCircular = await this.checkCircularDependency(id, parentId);
      if (isCircular) {
        throw new BadRequestException('不能将部门设置为其子部门的父部门');
      }
    }

    const dept = await this.findOne(id);
    Object.assign(dept, updateDeptDto);
    
    return await this.deptRepository.save(dept);
  }

  /**
   * 删除部门
   */
  async remove(id: number): Promise<void> {
    const dept = await this.findOne(id);

    // 检查是否有子部门
    const children = await this.findChildrenByParentId(id);
    if (children.length > 0) {
      throw new BadRequestException('该部门存在子部门，无法删除');
    }

    await this.deptRepository.remove(dept);
  }

  /**
   * 获取部门树形结构
   */
  async getDeptTree(): Promise<Dept[]> {
    const depts = await this.deptRepository.find({
      order: { parentId: 'ASC', orderNum: 'ASC' },
    });

    // 构建树形结构
    const deptMap = new Map<number, Dept>();
    const rootDepts: Dept[] = [];

    // 先创建所有部门的映射
    depts.forEach(dept => {
      deptMap.set(dept.id, { ...dept, children: [] });
    });

    // 构建父子关系
    depts.forEach(dept => {
      const currentDept = deptMap.get(dept.id);
      if (dept.parentId === 0) {
        // 根部门
        rootDepts.push(currentDept);
      } else {
        // 子部门
        const parentDept = deptMap.get(dept.parentId);
        if (parentDept) {
          parentDept.children.push(currentDept);
        }
      }
    });

    return rootDepts;
  }

  /**
   * 获取部门下拉选项
   */
  async getDeptOptions(): Promise<any[]> {
    const depts = await this.getDeptTree();
    return this.buildOptions(depts);
  }

  /**
   * 检查部门编码是否已存在
   */
  async checkDeptCode(deptCode: string, id?: number): Promise<boolean> {
    const queryBuilder = this.deptRepository.createQueryBuilder('dept')
      .where('dept.deptCode = :deptCode', { deptCode });

    if (id) {
      queryBuilder.andWhere('dept.id != :id', { id });
    }

    const count = await queryBuilder.getCount();
    return count > 0;
  }

  /**
   * 查找子部门
   */
  async findChildrenByParentId(parentId: number): Promise<Dept[]> {
    return this.deptRepository.find({
      where: { parentId, status: 1 },
      order: { orderNum: 'ASC' },
    });
  }

  /**
   * 检查循环依赖
   */
  private async checkCircularDependency(deptId: number, newParentId: number): Promise<boolean> {
    // 如果新父部门ID等于当前部门ID，直接返回true
    if (newParentId === deptId) {
      return true;
    }

    // 递归检查父部门的父部门是否包含当前部门
    const parentDept = await this.findOne(newParentId);
    if (parentDept.parentId && parentDept.parentId !== 0) {
      return await this.checkCircularDependency(deptId, parentDept.parentId);
    }

    return false;
  }

  /**
   * 构建下拉选项
   */
  private buildOptions(depts: Dept[], level = 0): any[] {
    const options = [];
    const prefix = level > 0 ? '　'.repeat(level) + '└─ ' : '';

    for (const dept of depts) {
      options.push({
        id: dept.id,
        label: prefix + dept.deptName,
        value: dept.id,
      });

      if (dept.children && dept.children.length > 0) {
        options.push(...this.buildOptions(dept.children, level + 1));
      }
    }

    return options;
  }
}
```

## 5. Controller层

```typescript
// dept.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { DeptService } from './dept.service';
import { CreateDeptDto, UpdateDeptDto, QueryDeptDto } from './dto/dept.dto';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';

@ApiTags('部门管理')
@Controller('dept')
export class DeptController {
  constructor(private readonly deptService: DeptService) {}

  @Post()
  @ApiOperation({ summary: '创建部门' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() createDeptDto: CreateDeptDto) {
    return await this.deptService.create(createDeptDto);
  }

  @Get()
  @ApiOperation({ summary: '分页查询部门' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async findAll(@Query() query: QueryDeptDto) {
    return await this.deptService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取部门' })
  @ApiParam({ name: 'id', description: '部门ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.deptService.findOne(id);
  }

  @Patch()
  @ApiOperation({ summary: '更新部门' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async update(@Body() updateDeptDto: UpdateDeptDto) {
    return await this.deptService.update(updateDeptDto.id, updateDeptDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除部门' })
  @ApiParam({ name: 'id', description: '部门ID' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.deptService.remove(id);
    return { message: '删除成功' };
  }

  @Get('tree')
  @ApiOperation({ summary: '获取部门树形结构' })
  async getDeptTree() {
    return await this.deptService.getDeptTree();
  }

  @Get('options')
  @ApiOperation({ summary: '获取部门下拉选项' })
  async getDeptOptions() {
    return await this.deptService.getDeptOptions();
  }

  @Get('checkCode')
  @ApiOperation({ summary: '检查部门编码是否已存在' })
  @ApiQuery({ name: 'deptCode', description: '部门编码' })
  @ApiQuery({ name: 'id', description: '部门ID（可选，用于编辑时排除当前部门）', required: false })
  async checkDeptCode(
    @Query('deptCode') deptCode: string,
    @Query('id') id?: number,
  ) {
    const exists = await this.deptService.checkDeptCode(deptCode, id ? parseInt(id) : undefined);
    return { exists };
  }
}
```

## 6. 模块定义

```typescript
// dept.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dept } from './entities/dept.entity';
import { DeptController } from './dept.controller';
import { DeptService } from './dept.service';

@Module({
  imports: [TypeOrmModule.forFeature([Dept])],
  controllers: [DeptController],
  providers: [DeptService],
  exports: [DeptService],
})
export class DeptModule {}
```

## 7. 前端API调用示例

```typescript
// 前端调用示例（已在您项目中实现）
import request from '@/api/request';

// 获取部门列表
export const getAllDept = async (params: DeptQueryParams) => {
  const res = await request({
    url: '/dept',
    method: 'get',
    params,
  });
  return res;
};

// 创建部门
export const createDept = async (data: Dept) => {
  const res = await request({
    url: '/dept',
    method: 'post',
    data,
  });
  return res;
};

// 更新部门
export const updateDept = async (data: Dept) => {
  const res = await request({
    url: '/dept',
    method: 'patch',
    data,
  });
  return res;
};

// 删除部门
export const delDept = async (id: string) => {
  const res = await request({
    url: `/dept/${id}`,
    method: 'delete',
  });
  return res;
};

// 获取部门树形结构
export const getDeptTree = async () => {
  const res = await request({
    url: '/dept/tree',
    method: 'get',
  });
  return res;
};

// 检查部门编码是否已存在
export const checkDeptCode = async (deptCode: string, id?: number) => {
  const params = id ? { deptCode, id } : { deptCode };
  const res = await request({
    url: '/dept/checkCode',
    method: 'get',
    params,
  });
  return res;
};
```

## 功能特点

1. **完整的CRUD操作**：支持部门的增删改查
2. **树形结构支持**：支持部门的层级关系管理
3. **数据验证**：使用class-validator进行数据验证
4. **循环依赖检测**：防止出现部门层级循环依赖
5. **编码唯一性校验**：确保部门编码的唯一性
6. **软删除支持**：可扩展支持软删除
7. **分页查询**：支持分页查询功能
8. **搜索功能**：支持按部门名称搜索
9. **状态管理**：支持部门启用/禁用状态
10. **Swagger文档**：完整的API文档

以上是完整的部门管理后端实现方案，包括所有必要的组件和功能。