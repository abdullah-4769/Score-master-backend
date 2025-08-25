import { Injectable } from '@nestjs/common';
import { PrismaService } from '../lib/prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}

  // Create a new role
  async createRole(data: CreateRoleDto) {
    return this.prisma.role.create({ data });
  }

  // Get all roles
  async getRoles() {
    return this.prisma.role.findMany();
  }

  // Get role by id
  async getRoleById(id: number) {
    return this.prisma.role.findUnique({ where: { id } });
  }

  // Update a role
  async updateRole(id: number, data: UpdateRoleDto) {
    return this.prisma.role.update({ where: { id }, data });
  }

  // Delete a role
  async deleteRole(id: number) {
    return this.prisma.role.delete({ where: { id } });
  }
}
