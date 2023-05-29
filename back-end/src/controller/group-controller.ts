import { NextFunction, Request, Response } from "express"
import { Group } from "../entity/group.entity"
import { GroupStudent as GroupStudentEntity } from "../entity/group-student.entity"
import { StudentRollState } from "../entity/student-roll-state.entity"
import { Roll as RollEntity } from "../entity/roll.entity"

import {Roll} from "../interface/roll.interface"

import { getRepository } from "typeorm"

import { CreateGroupDTO, UpdateGroupDTO, GroupDTO, GroupDeleteDTO } from "../dto/group.dto"

import { validate } from "class-validator"

export class GroupController {
  private groupRepository = getRepository(Group)
  private rollRepository = getRepository(RollEntity)
  private StudentRollStateRepository = getRepository(StudentRollState)
  private GroupStudentRepository = getRepository(GroupStudentEntity)


  /**
   * Fetches all groups from the database.
   *
   * @param request - The Express Request object.
   * @param response - The Express Response object.
   * @param next - The Express NextFunction.
   * @returns {Promise<GroupDTO[]>} A promise that resolves to an array of GroupDTO objects representing all groups.
   */
  async allGroups(request: Request, response: Response, next: NextFunction): Promise<GroupDTO[]> {
    try {
      const allGroups = await this.groupRepository.find()
      return response.status(200).json(allGroups)
    } catch (error) {
      // Handle any unexpected errors
      console.error("Error while retrieving groups:", error)
      return response.status(500).json({ error: "Internal server error" })
    }
  }

  /**
   * Create a new group.
   * @param {Request} request - The request object.
   * @param {Response} response - The response object.
   * @param {NextFunction} next - The next middleware function.
   * @returns {Promise<Group>} A Promise that resolves to the saved group state or an error response.
   */
  async createGroup(request: Request, response: Response, next: NextFunction): Promise<Group> {
    // Extract the request body parameters
    const { body: params } = request

    // Create a CreateGroupDTO object with the extracted parameters
    const createGroupInput: CreateGroupDTO = {
      name: params.name,
      number_of_weeks: params.number_of_weeks,
      roll_states: params.roll_states,
      incidents: params.incidents,
      ltmt: params.ltmt,
    }

    // Create a new Group instance
    const groupState = new Group()

    // Prepare the Group instance for creation using the createGroupInput
    groupState.prepareToCreate(createGroupInput)

    // Validate createGroupInput using class-validator
    const errors = await validate(groupState)

    if (errors.length > 0) {
      // If there are validation errors, send the response with error details
      return response.status(400).json({ error: "Validation failed", details: errors })
    }

    // Save the groupState using the groupRepository
    return this.groupRepository.save(groupState)
  }

  /**
   * Update a group with the provided data.
   *
   * @param request - The request object containing the update data.
   * @param response - The response object to send the result.
   * @param next - The next middleware function.
   * @returns {Promise<Group>} A Promise that resolves to the updated group or an error response.
   */
  async updateGroup(request: Request, response: Response, next: NextFunction): Promise<Group> {
    const { body: params } = request
    const id = request.params.id

    // Find the existing group by ID
    const existingGroup = await this.groupRepository.findOne(id)

    if (existingGroup !== undefined) {
      const updateGroupInput: UpdateGroupDTO = {
        id: existingGroup.id,
        incidents: params?.incidents ? params?.incidents : existingGroup.incidents,
        ltmt: params?.ltmt ? params.ltmt : existingGroup.ltmt,
        name: params?.name ? params.name : existingGroup.name,
        number_of_weeks: params?.number_of_weeks ? params.number_of_weeks : existingGroup.number_of_weeks,
        roll_states: params?.roll_states ? params.roll_states : existingGroup.roll_states,
        student_count: params?.student_count ? params.student_count : existingGroup.student_count,
      }

      // Validate updateGroupInput using class-validator
      const errors = await validate(existingGroup)

      if (errors.length > 0) {
        // If there are validation errors, send the response with error details
        return response.status(400).json({ error: "Validation failed", details: errors })
      }

      existingGroup.prepareToUpdate(updateGroupInput)
      return this.groupRepository.save(existingGroup)
    } else {
      // If the group is not found, send a 404 error response
      return response.status(404).json({ error: "Group not found" })
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
      console.log(typeof id)
      // Validate request body using GroupDelete DTO
      const deleteGroupInput: GroupDeleteDTO = { id }
      const errors = await validate(deleteGroupInput)

      // If validation errors exist, return a 400 response with error details
      if (errors.length > 0) {
        return response.status(400).json({ error: "Validation failed", details: errors })
      }

      // Find the group by ID
      const group = await this.groupRepository.findOne(id)

      // If group is not found then return with 404 response
      if (!group) {
        return response.status(404).json({ error: "Group not found" })
      }

      // Delete the group
      await this.groupRepository.delete(id)

      return response.status(200).json({ message: "Group deleted successfully" })
    } catch (error) {
      // Handle any unexpected errors
      console.error("Error while deleting group:", error)
      return response.status(500).json({ error: "Internal server error" })
    }
  }
  async getGroupStudents(request: Request, response: Response, next: NextFunction) {

  }

  async runGroupFilters(request: Request, response: Response, next: NextFunction) {
    // Task 2:
    // 1. Clear out the groups (delete all the students from the groups)
    // 2. For each group, query the student rolls to see which students match the filter for the group
    // 3. Add the list of students that match the filter to the group
  }
}
