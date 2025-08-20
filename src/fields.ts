import axios from "axios";
import { CMP_BASE_URL } from "./config";
import { getHeaderValues } from "./auth";

export interface IField {
  id: string;
  name: string;
  type: string;
  [key: string]: any;
}

export const getAllFields = async (): Promise<IField[]> => {
  const headers = await getHeaderValues();
  const pageSize = 100; // API allows up to 100
  let offset = 0;
  let allFields: IField[] = [];
  let hasMore = true;

  while (hasMore) {
    const url = `${CMP_BASE_URL}/v3/fields?offset=${offset}&page_size=${pageSize}`;
    const res = await axios.get(url, { headers });

    const fields: IField[] = res.data?.data || [];
    allFields = [...allFields, ...fields];

    // Check if more pages exist
    if (fields.length < pageSize) {
      hasMore = false;
    } else {
      offset += pageSize;
    }
  }

  return allFields;
};
