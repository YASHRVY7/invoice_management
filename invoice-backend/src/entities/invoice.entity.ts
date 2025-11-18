import { BeforeInsert, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { InvoiceItem } from "./invoice-item.entity";
import { User } from "./user.entity";

@Entity('invoices')
export class Invoice {
    @PrimaryGeneratedColumn()
    id: number;


    @Column({ unique: true, length: 50 })
    invoiceNumber: string

    @Column({ length: 255 })
    clientName: string

    @Column({ type: 'text', nullable: true })
    clientAddress: string | null

    @Column({ type: 'varchar', length: 255, nullable: true })
    clientEmail: string | null;

    @Column({ type: 'varchar', length: 50, nullable: true })
    clientPhone: string | null;

    @Column({ type: 'date' })
    issueDate: Date;

    @Column({ type: 'date', nullable: true })
    dueDate: Date | null;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    subtotal: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    taxAmount: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    totalAmount: number;


    @Column({
        type: 'enum',
        enum: ['unpaid', 'paid', 'overdue', 'cancelled'],
        default: 'unpaid',
    })
    status: string;

    @OneToMany(() => InvoiceItem, (item) => item.invoice, {
        cascade: true,
        eager: true,
    })
    items: InvoiceItem[];

    @ManyToOne(() => User, (user) => user.invoices, { onDelete: 'CASCADE', nullable: true })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ name: 'user_id', nullable: true })
    userId: number | null;

    

    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;

    @BeforeInsert()
    generateInvoiceNumber() {
      const date = new Date();
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      this.invoiceNumber = `INV-${year}${month}-${random}`;
    }

}