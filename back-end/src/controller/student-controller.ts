import { getRepository } from "typeorm"
import { NextFunction, Request, Response } from "express"
import { Student } from "../entity/student.entity"
import { CreateStudentInput, UpdateStudentInput } from "../interface/student.interface"
import { constants as STATUS_CODES } from "http2"



export class StudentController {
  private studentRepository = getRepository(Student)

  async allStudents(request: Request, response: Response, next: NextFunction) {
    const allStudents = await this.studentRepository.find()
    return response.status(STATUS_CODES.HTTP_STATUS_OK).json(allStudents)
  }

  async createStudent(request: Request, response: Response, next: NextFunction) {
    const { body: params } = request

    const createStudentInput: CreateStudentInput = {
      first_name: params.first_name,
      last_name: params.last_name,
      photo_url: params.photo_url,
    }
    const student = new Student()
    student.prepareToCreate(createStudentInput)

    const newStudent = await this.studentRepository.save(student)
    
    return response.status(STATUS_CODES.HTTP_STATUS_OK).json(newStudent)
  }

  async updateStudent(request: Request, response: Response, next: NextFunction) {
    const { body: params } = request

    const student = await this.studentRepository.findOne(params.id)
      const updateStudentInput: UpdateStudentInput = {
        id: params.id,
        first_name: params.first_name,
        last_name: params.last_name,
        photo_url: params.photo_url,
      }
      student.prepareToUpdate(updateStudentInput)

      const updatedStudent =  await this.studentRepository.save(student)
      return response.status(STATUS_CODES.HTTP_STATUS_OK).json(updatedStudent)
    
  }

  async removeStudent(request: Request, response: Response, next: NextFunction) {
    let studentToRemove = await this.studentRepository.findOne(request.params.id)
    await this.studentRepository.remove(studentToRemove)
    return response.status(STATUS_CODES.HTTP_STATUS_OK).json({message: `Student with id: ${request.param.id} deleted successfully.`})
  }
}
