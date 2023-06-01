export interface GroupInterface {
    id: number;
    name: string;
    number_of_weeks: number;
    roll_states: string;
    incidents: number;
    ltmt: string;
    student_count: number
}

export interface  CreateGroup {
    name: string;
    number_of_weeks: number;
    roll_states: string;
    incidents: number;
    ltmt: string;
}

export interface  UpdateGroup {
    id: number;
    name: string;
    number_of_weeks: number;
    roll_states: string;
    incidents: number;
    ltmt: string;
    student_count: number
}

export interface GroupDelete {
    id: number
}