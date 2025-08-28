import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../lib/prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from '@prisma/client';
import { Prisma } from '@prisma/client';


@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}

  // Create a new role
async createRole(data: CreateRoleDto) {
  return this.prisma.role.create({
    data: data as Prisma.RoleCreateInput,
  });
}

  // Get all roles
  async getRoles(): Promise<Role[]> {
    return this.prisma.role.findMany();
  }

  // Get role by id
  async getRoleById(id: number): Promise<Role> {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) throw new NotFoundException(`Role with ID ${id} not found`);
    return role;
  }

  // Update a role
  async updateRole(id: number, data: UpdateRoleDto): Promise<Role> {
    return this.prisma.role.update({
      where: { id },
      data,
    });
  }

  // Delete a role
  async deleteRole(id: number): Promise<Role> {
    return this.prisma.role.delete({
      where: { id },
    });
  }
}
