
export class  CreateGroupDTO {
    name: string;
    number_of_weeks: number;
    roll_states: string;
    incidents: number;
    ltmt: string;
}

export class  UpdateGroupDTO {
    id: number;
    name: string;
    number_of_weeks: number;
    roll_states: string;
    incidents: number;
    ltmt: string;
    student_count: number
}

