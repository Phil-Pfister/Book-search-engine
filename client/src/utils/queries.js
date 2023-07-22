import { gql } from '@apollo/client';

export const QUERY_ME = gql`
{
    me{
        _idusername
        emailbookCount
        savedBooks {
            bookId
            authors
            title
            description
            imagelink
        }
    }
}
`;