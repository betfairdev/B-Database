import { Injectable } from '@nestjs/common';
import { getRepository } from '../../dbconfig';
import { User } from '../../entities/user.entity';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class AuthService {
  constructor(
    private firebaseService: FirebaseService,
  ) {}

  async validateFirebaseToken(idToken: string): Promise<User> {
    const decodedToken = await this.firebaseService.verifyIdToken(idToken);
    const userRepository = getRepository(User);
    
    let user = await userRepository.findOne({
      where: { firebaseUid: decodedToken.uid },
    });

    if (!user) {
      user = userRepository.create({
        firebaseUid: decodedToken.uid,
        email: decodedToken.email,
        displayName: decodedToken.name,
        photoURL: decodedToken.picture,
      });
      await userRepository.save(user);
    }

    return user;
  }

  async findUserById(id: string): Promise<User> {
    const userRepository = getRepository(User);
    return userRepository.findOne({ where: { id } });
  }
}