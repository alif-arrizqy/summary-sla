import { RowDataPacket } from "mysql2";

export default interface Sla extends RowDataPacket {
  site_id?: string;
  date?: Date;
  sites?: string;
  sla?: number;
  log_harian?: string;
  id?: number;
}