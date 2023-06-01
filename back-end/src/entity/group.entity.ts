import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"
import { CreateGroup, UpdateGroup } from "../interface/group.interface"
import { IsNotEmpty, IsString, IsInt, IsIn, IsDate, IsNumber } from 'class-validator';
import {IsValidCsv} from "../utils/csvValidator"

@Entity()
export class Group {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  name: string

  @Column()
  @IsInt({ message: 'Number of weeks must be an integer' })
  number_of_weeks: number

  @Column()
  @IsValidCsv()
  roll_states: string

  @Column()
  @IsInt({ message: 'Incidents must be an integer' })
  incidents: number

  @Column()
  @IsIn(['<', '>'], { message: 'LTMT must be either "<" or ">"' })
  ltmt: string

  @Column({
    nullable: true,
  })
  run_at: Date

  @Column()
  student_count: number


  private setGroupProperties(input: CreateGroup | UpdateGroup) {
    const { name, number_of_weeks, roll_states, incidents, ltmt } = input
    this.name = name
    this.number_of_weeks = number_of_weeks
    this.roll_states = roll_states
    this.incidents = incidents
    this.ltmt = ltmt
  }

  public prepareToCreate(input: CreateGroup) {
    this.setGroupProperties(input)
    this.student_count = 0
  }

  public prepareToUpdate(input: UpdateGroup, run_at?: Date) {
    this.setGroupProperties(input)
    this.student_count = input.student_count
    this.id = input.id

    if(run_at) 
    this.run_at = run_at
  }
}
