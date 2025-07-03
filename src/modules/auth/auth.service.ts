import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private firebaseService: FirebaseService,
  ) {}

  async validateFirebaseToken(idToken: string): Promise<User> {
    const decodedToken = await this.firebaseService.verifyIdToken(idToken);
    
    let user = await this.userRepository.findOne({
      where: { firebaseUid: decodedToken.uid },
    });

    if (!user) {
      user = this.userRepository.create({
        firebaseUid: decodedToken.uid,
        email: decodedToken.email,
        displayName: decodedToken.name,
        photoURL: decodedToken.picture,
      });
      await this.userRepository.save(user);
    }

    return user;
  }

  async findUserById(id: string): Promise<User> {
    return this.userRepository.findOne({ where: { id } });
  }
}