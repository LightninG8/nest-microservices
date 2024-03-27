import { Injectable } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { RMQService } from 'nestjs-rmq';
import { UserEntity } from './entities/user.entity';
import { IUser } from '@purple/interfaces';
import { BuyCourseSaga } from './sagas/buy-course.saga';
import { UserEvenetEmitter } from './user.event-emitter';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly rmqService: RMQService,
    private readonly userEventEmitter: UserEvenetEmitter
  ) {}

  public async changeProfile(user: Pick<IUser, 'displayName'>, id: string) {
    const existedUser = await this.userRepository.findUserById(id);

    if (!existedUser) {
      throw new Error('Такого пользователя не существует');
    }

    const userEntity = new UserEntity(existedUser).updateProfile(
      user.displayName
    );

    await this.userRepository.updateUser(userEntity);
    this.updateUser(userEntity);

    return {
      user,
    };
  }

  public async buyCourse(userId: string, courseId: string) {
    const existedUser = await this.userRepository.findUserById(userId);

    if (!existedUser) {
      throw new Error('Такого пользователя нет');
    }

    const userEntity = new UserEntity(existedUser);

    const saga = new BuyCourseSaga(userEntity, courseId, this.rmqService);

    const { user, paymentLink } = await saga.getState().pay();

    await this.userRepository.updateUser(user);
    this.updateUser(user);

    return { paymentLink };
  }

  public async checkPayment(userId: string, courseId: string) {
    const existedUser = await this.userRepository.findUserById(userId);

    if (!existedUser) {
      throw new Error('Такого пользователя нет');
    }

    const userEntity = new UserEntity(existedUser);

    const saga = new BuyCourseSaga(userEntity, courseId, this.rmqService);
    const { user, status } = await saga.getState().checkPayment();

    await this.userRepository.updateUser(user);
    this.updateUser(user);
  
    return { status };
  }


  private updateUser(user: UserEntity) {
    return Promise.all([
      this.userEventEmitter.handle(user),
      this.userRepository.updateUser(user)
    ])
  } 
}
