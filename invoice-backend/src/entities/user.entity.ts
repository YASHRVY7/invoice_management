import { Entity, OneToMany, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Invoice } from "./invoice.entity";
import { Role } from "src/admin/enum/roles.enum";

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    username: string

    @Column({ unique: true })
    email: string

    @Column()
    password: string;

    @Column({ default: Role.User })
    role: Role;


    @Column({ default: true })
    isActive: boolean

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @OneToMany(() => Invoice, (invoice) => invoice.user)
    invoices: Invoice[];
}