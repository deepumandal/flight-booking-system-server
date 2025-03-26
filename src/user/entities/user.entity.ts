import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 255 })
  name: string;

  @Column({ type: "varchar", unique: true, length: 255 })
  email: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  password: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  contactNumber: string;

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt: Date;

  @CreateDateColumn({ type: "timestamp with time zone" })
  updatedAt: Date;
}
