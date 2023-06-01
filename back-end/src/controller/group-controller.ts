import { NextFunction, Request, Response } from "express"
import { Group } from "../entity/group.entity"
import { GroupStudent } from "../entity/group-student.entity"
import { Roll } from "../entity/roll.entity"

import { getRepository } from "typeorm"

import { constants as STATUS_CODES } from "http2"

import { CreateGroup, UpdateGroup, GroupInterface, GroupDelete } from "../interface/group.interface"
import { StudentGroup } from "../interface/student.interface"
import { createStudentGroup } from "../interface/student-group.interface"

import { validate } from "class-validator"
import { Student } from "../entity/student.entity"

import { convertCsvToArray, generatePastTimestamp } from "../utils/utils"
import { StudentRollState } from "../entity/student-roll-state.entity"
import { HoustonCustomError } from "../middleware/houston.middleware"

export class GroupController {
  private groupRepository = getRepository(Group)
  private studentRepository = getRepository(Student)
  private groupStudentRepository = getRepository(GroupStudent)
  private rollRepository = getRepository(Roll)
  private studentRollState = getRepository(StudentRollState)

  /**
   * Fetches all groups from the database.
   *
   * @param request - The Express Request object.
   * @param response - The Express Response object.
   * @param next - The Express NextFunction.
   */
  async allGroups(request: Request, response: Response, next: NextFunction){
    try {
      const allGroups = await this.groupRepository.find()
      return response.status(STATUS_CODES.HTTP_STATUS_OK).json(allGroups)
    } catch (error) {
      next(error)
    }
  }

  /**
   * Create a new group.
   * @param {Request} request - The request object.
   * @param {Response} response - The response object.
   * @param {NextFunction} next - The next middleware function.
   */
  async createGroup(request: Request, response: Response, next: NextFunction) {
    try {
      // Extract the request body parameters
      const { name, number_of_weeks, roll_states, incidents, ltmt } = request.body

      // Create a CreateGroup object with the extracted parameters
      const createGroupInput: CreateGroup = {
        name,
        number_of_weeks,
        roll_states,
        incidents,
        ltmt,
      }

      // Create a new Group instance
      const groupState = new Group()

      // Prepare the Group instance for creation using the createGroupInput
      groupState.prepareToCreate(createGroupInput)

      // Validate createGroupInput using class-validator
      const errors = await validate(groupState)

      if (errors.length > 0) {
        // If there are validation errors, send the response with error details
        throw new HoustonCustomError( STATUS_CODES.HTTP_STATUS_NOT_FOUND ,"Validation Failed", errors)
      }

      // Save the groupState using the groupRepository
      await this.groupRepository.save(groupState)

      return response.status(STATUS_CODES.HTTP_STATUS_CREATED).json(groupState)
    } catch (error) {
      next(error)
    }
  }

  /**
   * Update a group with the provided data.
   *
   * @param request - The request object containing the update data.
   * @param response - The response object to send the result.
   * @param next - The next middleware function.

   */
  async updateGroup(request: Request, response: Response, next: NextFunction){
    try {
      const { body: params } = request
      const id = request.params.id

      // Find the existing group by ID
      const existingGroup = await this.groupRepository.findOne(id)

      if (existingGroup !== undefined) {
        const updateGroupInput: UpdateGroup = {
          id: existingGroup.id,
          incidents: params?.incidents ?? existingGroup.incidents,
          ltmt: params?.ltmt ?? existingGroup.ltmt,
          name: params?.name ?? existingGroup.name,
          number_of_weeks: params?.number_of_weeks ?? existingGroup.number_of_weeks,
          roll_states: params?.roll_states ?? existingGroup.roll_states,
          student_count: params?.student_count ?? existingGroup.student_count,
        };

        existingGroup.prepareToUpdate(updateGroupInput)

        // Validate updateGroupInput using class-validator
        const errors = await validate(existingGroup)

        if (errors.length > 0) {
          // If there are validation errors, send the response with error details
          throw new HoustonCustomError( STATUS_CODES.HTTP_STATUS_BAD_REQUEST ,"Validation Failed", errors)
        }


        return response.status(STATUS_CODES.HTTP_STATUS_OK).json(existingGroup)
      } else {
        // If the group is not found, send a 404 error response
        return response.status(STATUS_CODES.HTTP_STATUS_NOT_FOUND).json({ error: "Group not found" })
      }
    } catch (error) {
      next(error)
    }
  }

  /**
   * Remove a group from the database.
   * @param request - The request object containing the group ID in the parameters.
   * @param response - The response object used to send the HTTP response.
   * @param next - The next function used for middleware chaining.
   * @returns A JSON response indicating the status of the deletion operation.
   */
  async removeGroup(request: Request, response: Response, next: NextFunction) {
    try {
      const { id } = request.params
      // Validate request body using GroupDelete DTO
      const deleteGroupInput: GroupDelete = { id }
      const errors = await validate(deleteGroupInput)

      // If validation errors exist, return a 400 response with error details
      if (errors.length > 0) {
        throw new HoustonCustomError( STATUS_CODES.HTTP_STATUS_BAD_REQUEST ,"Validation Failed")
      }

      // Find the group by ID
      const group = await this.groupRepository.findOne(id)

      // If group is not found then return with 404 response
      if (!group) {
        // If there are validation errors, send the response with error details
        throw new HoustonCustomError( STATUS_CODES.HTTP_STATUS_NOT_FOUND ,`Target Group Not Found With ID: ${id}`)
      }

      // Delete the group
      await this.groupRepository.delete(id)

      return response.status(STATUS_CODES.HTTP_STATUS_OK).json({ message: "Group deleted successfully" })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Fetches students belonging to a group.
   * @param request - The Express request object.
   * @param response - The Express response object.
   * @param next - The NextFunction to pass control to the next middleware.

   */
  async getGroupStudents(request: Request, response: Response, next: NextFunction) {
    try {
      const id = request.params.groupId

      // Find the group by ID
      const group = await this.groupRepository.findOne(id)

      // If group is not found, return with 404 response
      if (!group) {
        throw new HoustonCustomError( STATUS_CODES.HTTP_STATUS_NOT_FOUND ,`Target Group Not Found With ID: ${id}`)
      }

      
      const students = await this.studentRepository
        .createQueryBuilder("student")
        .leftJoin(GroupStudent, "groupStudent", "student.id = groupStudent.student_id")
        .select(["student.first_name", "student.last_name", "student.id"])
        .where("groupStudent.group_id = :group_id", { group_id: id })
        .getMany()

      console.log(students)
      // Add full_name property to each student object
      const studentsWithFullName: StudentGroup[] = students.map((student) => {
        return {
          student_id: student.id,
          first_name: student.first_name,
          last_name: student.last_name,
          full_name: `${student.first_name} ${student.last_name}`,
        }
      })

      return response.status(STATUS_CODES.HTTP_STATUS_OK).json(studentsWithFullName)
    } catch (error) {
      next(error)
    }
  }

  /**
   * Runs group filters.
   * @param {Request} request - The request object.
   * @param {Response} response - The response object.
   * @param {NextFunction} next - The next middleware function.

   */
  async runGroupFilters(request: Request, response: Response, next: NextFunction) {
    try {
      // Clear Group Students
      await this.groupStudentRepository.clear()

      // Get all the groups
      const groups = await this.groupRepository.find()

      // Get the current timestamp in ISO format
      const currentTimestamp = new Date().toISOString()

      groups.forEach(async (group) => {
        // Convert the roll_states string into an array
        const arrayOfStates = convertCsvToArray(group.roll_states, ",")

        const groupId = group.id
        const numberOfWeeks = group.number_of_weeks
        const incidents = group.incidents
        const ltmt = group.ltmt

        // Generate the past timestamp based on the current timestamp and number of weeks
        const pastTimestamp = generatePastTimestamp(currentTimestamp, numberOfWeeks)

        // Retrieve the rolls within the specified time range
        const roll = await this.rollRepository
          .createQueryBuilder("roll")
          .select("roll.id as id")
          .where("roll.completed_at <= :currentTimestamp", { currentTimestamp })
          .andWhere("roll.completed_at > :pastTimestamp", { pastTimestamp })
          .getRawMany()


        const rollIDs = roll.map((roll) => roll.id)

        // Retrieve students with the specified roll IDs and matching roll states
        const students = await this.studentRollState
          .createQueryBuilder("studentRoll")
          .select("studentRoll.student_id, COUNT(*)", "incident_count")
          .addSelect(`${groupId}`, "group_id")
          .where(`studentRoll.roll_id IN (${rollIDs})`)
          .andWhere("studentRoll.state IN (:...arrayOfStates)", { arrayOfStates })
          .groupBy("studentRoll.student_id")
          .having(`COUNT(*) ${ltmt} ${incidents}`)
          .getRawMany()


        const groupStudentUpdate: GroupStudent[] = []

        students.forEach((student) => {
          // Create an input object for creating GroupStudent
          const createStudentGroupInput: createStudentGroup = {
            student_id: student.student_id,
            group_id: student.group_id,
            incident_count: student.incident_count,
          }

          const groupStudent = new GroupStudent()
          groupStudent.prepareToCreate(createStudentGroupInput)
          groupStudentUpdate.push(groupStudent)
        })

        await this.groupStudentRepository.save(groupStudentUpdate)

        const groupData = await this.groupRepository.findOne(groupId)

        // Prepare the UpdateGroup object with updated information
        const updateGroupInput: UpdateGroup  = {
          id: groupData.id,
          name: groupData.name,
          number_of_weeks: groupData.number_of_weeks,
          roll_states: groupData.roll_states,
          ltmt: groupData.ltmt,
          incidents: groupData.incidents,
          student_count: students.length,
        }

        groupData.prepareToUpdate(updateGroupInput, new Date(currentTimestamp))
        await this.groupRepository.save(groupData)
      })

      return response.status(STATUS_CODES.HTTP_STATUS_OK).json({ message: "Group Filter Ran successfully" })
    } catch (error) {
      next(error)
    }
  }
}
