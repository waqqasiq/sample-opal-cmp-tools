import axios from "axios";
import { CMP_BASE_URL } from "./config";
import { AuthData } from './types/auth';

export interface IField {
    id: string;
    name: string;
    type: string;
    [key: string]: any;
}

function generateNumericId() {
    let id = '';
    for (let i = 0; i < 10; i++) {
        id += Math.floor(Math.random() * 10); // digits 0-9
    }
    return id;
}

export const getAllFields = async (authData: AuthData): Promise<IField[]> => {
    //   const headers = await getHeaderValues();
    const headers = {
        'Accept': 'application/json',
        'x-auth-token-type': 'opti-id',
        'Authorization': authData.credentials.token_type + ' ' + authData.credentials.access_token,
        'Accept-Encoding': 'gzip',
        'x-request-id': generateNumericId(),
        'x-org-sso-id': authData.credentials.org_sso_id
    }

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
