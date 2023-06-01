import { getRepository } from "typeorm"
import { NextFunction, Request, Response } from "express"
import { Roll } from "../entity/roll.entity"
import { StudentRollState } from "../entity/student-roll-state.entity"
import { CreateRollInput, UpdateRollInput } from "../interface/roll.interface"
import { CreateStudentRollStateInput, UpdateStudentRollStateInput } from "../interface/student-roll-state.interface"
import { constants as STATUS_CODES } from "http2"

import { map } from "lodash"

export class RollController {
  private rollRepository = getRepository(Roll)
  private studentRollStateRepository = getRepository(StudentRollState)

  async allRolls(request: Request, response: Response, next: NextFunction) {
    const allRolls = await  this.rollRepository.find()
    return response.status(STATUS_CODES.HTTP_STATUS_OK).json(allRolls)
  }

  async createRoll(request: Request, response: Response, next: NextFunction) {
    const { body: params } = request

    const createRollInput: CreateRollInput = {
      name: params.name,
      completed_at: params.completed_at,
    }
    const roll = new Roll()
    roll.prepareToCreate(createRollInput)
    const newRoll = await  this.rollRepository.save(roll)
    return response.status(STATUS_CODES.HTTP_STATUS_OK).json(newRoll)
  }

  async updateRoll(request: Request, response: Response, next: NextFunction) {
    const { body: params } = request

    const roll = await this.rollRepository.findOne(params.id)
      const updateRollInput: UpdateRollInput = {
        id: params.id,
        name: params.name,
        completed_at: params.completed_at,
      }

      roll.prepareToUpdate(updateRollInput)
      const updatedRoll = await this.rollRepository.save(roll)
      return response.status(STATUS_CODES.HTTP_STATUS_OK).json(updatedRoll)

  }

  async removeRoll(request: Request, response: Response, next: NextFunction) {
    let rollToRemove = await this.rollRepository.findOne(request.params.id)
    await this.rollRepository.remove(rollToRemove)
    return response.status(STATUS_CODES.HTTP_STATUS_OK).json({message: "Removed Roll With Id: ${rollToRemove}"})
  }

  async getRoll(request: Request, response: Response, next: NextFunction) {
    const roll = await  this.studentRollStateRepository.find({ roll_id: request.params.id })
    return response.status(STATUS_CODES.HTTP_STATUS_OK).json(roll)
  }

  async addStudentRollStates(request: Request, response: Response, next: NextFunction) {
    const { body: params } = request
    const studentRollStates: StudentRollState[] = map(params, (param) => {
      const createStudentRollStateInput: CreateStudentRollStateInput = {
        roll_id: param.roll_id,
        student_id: param.student_id,
        state: param.state,
      }

      const studentRollState = new StudentRollState()
      studentRollState.prepareToCreate(createStudentRollStateInput)
      return studentRollState
    })

    const result = await this.studentRollStateRepository.save(studentRollStates)
    return response.status(STATUS_CODES.HTTP_STATUS_OK).json(result)
  }

  async addStudentRollState(request: Request, response: Response, next: NextFunction) {
    const { body: params } = request

    const createStudentRollStateInput: CreateStudentRollStateInput = {
      roll_id: params.roll_id,
      student_id: params.student_id,
      state: params.state,
    }
    const studentRollState = new StudentRollState()
    studentRollState.prepareToCreate(createStudentRollStateInput)
    await this.studentRollStateRepository.save(studentRollState)

    return response.status(STATUS_CODES.HTTP_STATUS_OK).json(studentRollState)
  }

  async updateStudentRollState(request: Request, response: Response, next: NextFunction) {
    const { body: params } = request

    const studentRollState = await this.studentRollStateRepository.findOne(params.id)
      const updateStudentRollStateInput: UpdateStudentRollStateInput = {
        id: params.id,
        roll_id: params.roll_id,
        student_id: params.student_id,
        state: params.state,
      }
      studentRollState.prepareToUpdate(updateStudentRollStateInput)
      const updatedStudentRollState = await this.studentRollStateRepository.save(studentRollState)
    
      return response.status(STATUS_CODES.HTTP_STATUS_OK).json(updatedStudentRollState)
  }
}
