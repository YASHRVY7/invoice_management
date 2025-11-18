import { BeforeInsert, BeforeUpdate, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Invoice } from './invoice.entity';

@Entity('invoice_items')
export class InvoiceItem {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'int', default: 1 })
    quantity: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    unitPrice: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    totalPrice: number;

    @ManyToOne(() => Invoice, (invoice) => invoice.items, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'invoice_id' })
    invoice: Invoice;

    @Column({ name: 'invoice_id' })
    invoiceId: number;

    @BeforeInsert()
    @BeforeUpdate()
    calculateTotalPrice() {
        this.totalPrice = this.quantity * this.unitPrice;
    }

}