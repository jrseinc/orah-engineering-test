import { NextFunction, Request, Response } from "express"
import { Group } from "../entity/group.entity"
import { getRepository } from "typeorm"

import { CreateGroupDTO } from "../dto/group.interface"

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
  const { body: params } = request;

  // Create a CreateGroupDTO object with the extracted parameters
  const createGroupInput = {
    name: params.name,
    number_of_weeks: params.number_of_weeks,
    roll_states: params.roll_states,
    incidents: params.incidents,
    ltmt: params.ltmt,
  };

  // Create a new Group instance
  const groupState = new Group();

  // Prepare the Group instance for creation using the createGroupInput
  groupState.prepareToCreate(createGroupInput);

  // Validate createGroupInput using class-validator
  const errors = await validate(groupState);

  if (errors.length > 0) {
    // If there are validation errors, send the response with error details
    return response.status(400).json({ error: "Validation failed", details: errors });
  }

  // Save the groupState using the groupRepository
  return this.groupRepository.save(groupState);
}


  async updateGroup(request: Request, response: Response, next: NextFunction) {
    // Task 1:
    // Update a Group
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
