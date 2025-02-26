export interface IDataRecord {
  id: string;
  name: string;
  description: string;
  logo: string;
  date_release: string;
  date_revision: string;
}

export interface IDataResponse {
  data: IDataRecord[];
}
