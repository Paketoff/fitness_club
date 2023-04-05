import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  
  async createUser(user: UserEntity): Promise<UserEntity> {
    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(user.password, salt);
    return await this.userRepository.save(user);
  }


  async findByEmail(email: string): Promise<UserEntity | undefined> {
    return await this.userRepository.findOne(
      {where: {email}}
    );
  }

  async findById(id: number): Promise<UserEntity | undefined> {
    return await this.userRepository.findOne(
     {where: {id_user: id}}
    );
  }

  async updateUser(id: number, updatedData: Partial<UserEntity>): Promise<UserEntity> {
    const user = await this.userRepository.preload({
      id_user: id,
      ...updatedData,
    })

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    if (updatedData.password) {
      const salt = await bcrypt.genSalt(12);
      user.password = await bcrypt.hash(updatedData.password, salt);
    }

    return await this.userRepository.save(user);
  }



  async deleteUser(id: number): Promise<void> {
    const result = await this.userRepository.delete(id);

    if(result.affected === 0) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
  }
}