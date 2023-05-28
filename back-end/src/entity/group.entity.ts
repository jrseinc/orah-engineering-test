import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"
import { CreateGroupDTO } from "../dto/group.interface"
import { IsNotEmpty, IsString } from 'class-validator';

@Entity()
export class Group {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  name: string

  @Column()
  number_of_weeks: number

  @Column()
  roll_states: string

  @Column()
  incidents: number

  @Column()
  ltmt: string

  @Column({
    nullable: true,
  })
  run_at: Date

  @Column()
  student_count: number


  public prepareToCreate(input: CreateGroupDTO) {
    const {name, number_of_weeks, roll_states, incidents, ltmt, run_at} = input
    this.name = name
    this.number_of_weeks = number_of_weeks
    this.roll_states = roll_states
    this.incidents = incidents
    this.ltmt = ltmt
    this.student_count = 0
  }

}
