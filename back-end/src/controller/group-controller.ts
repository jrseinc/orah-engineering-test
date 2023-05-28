import { NextFunction, Request, Response } from "express"
import { Group } from "../entity/group.entity"
import { getRepository } from "typeorm"

import { CreateGroupDTO, UpdateGroupDTO } from "../dto/group.interface"

import { validate } from "class-validator"

export class GroupController {
  private groupRepository = getRepository(Group)

  async allGroups(request: Request, response: Response, next: NextFunction) {
    // Task 1:
    // Return the list of all groups
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

  async updateGroup(request: Request, response: Response, next: NextFunction) {
    const { body: params } = request
    const id = request.params.id;

    const existingGroup = await this.groupRepository.findOne(id)

    if(existingGroup !== undefined) {

      const updateGroupInput : UpdateGroupDTO = {
        id: existingGroup.id,
        incidents: params?.incidents ? params?.incidents : existingGroup.incidents,
        ltmt: params?.ltmt ? params.ltmt : existingGroup.ltmt,
        name: params?.name ? params.name : existingGroup.name,
        number_of_weeks: params?.number_of_weeks ? params.number_of_weeks : existingGroup.number_of_weeks,
        roll_states : params?.roll_states ? params.roll_states : existingGroup.roll_states,
        student_count: params?.student_count ? params.student_count : existingGroup.student_count,
      }

  
      // Validate createGroupInput using class-validator
      const errors = await validate(existingGroup)
  
      if (errors.length > 0) {
        // If there are validation errors, send the response with error details
        return response.status(400).json({ error: "Validation failed", details: errors })
      }

      existingGroup.prepareToUpdate(updateGroupInput)
      return this.groupRepository.save(existingGroup)
    } else {
      return response.status(404).json({ error: 'Group not found' });
    }

   
  }

  async removeGroup(request: Request, response: Response, next: NextFunction) {
    // Task 1:
    // Delete a Group
  }

  async getGroupStudents(request: Request, response: Response, next: NextFunction) {
    // Task 1:
    // Return the list of Students that are in a Group
  }

  async runGroupFilters(request: Request, response: Response, next: NextFunction) {
    // Task 2:
    // 1. Clear out the groups (delete all the students from the groups)
    // 2. For each group, query the student rolls to see which students match the filter for the group
    // 3. Add the list of students that match the filter to the group
  }
}
