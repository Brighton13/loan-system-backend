import { Model, Optional } from 'sequelize';
export declare enum UserRole {
    ADMIN = "admin",
    USER = "user"
}
interface UserAttributes {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    password: string;
    role: UserRole;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'isActive'> {
}
declare class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    password: string;
    role: UserRole;
    isActive: boolean;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    comparePassword(password: string): Promise<boolean>;
}
export default User;
//# sourceMappingURL=User.d.ts.map