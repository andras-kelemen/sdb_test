export type Appointment = {
  id: number;
  title: string;
  start_datetime: Date;
  end_datetime: Date;
  participants: Employee[];
  employee?: Employee | null;
};

export type RawAppointment = {
  id: string;
  title: string;
  start_datetime: string;
  end_datetime: string;
  participants: Employee[];
  employee: Employee;
};

export interface Department {
  id: number;
  url: string;
  name: string;
  manager: string;
}

export interface Employee {
  id: number;
  url: string;
  name: string;
  email: string;
  department: Department;
}
