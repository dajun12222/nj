const token ='eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOlsiYXBpIl0sImNvcnBJZCI6bnVsbCwidXNlcl9pZCI6IjJjOTY4MDY1ODQ4MzQwZTkwMTg0ODQxZjllYTAwMDE3IiwidXNlcl9uYW1lIjoiemN3Iiwic2NvcGUiOlsicmVhZCJdLCJtb2JpbGUiOmZhbHNlLCJpc0FkbWluIjp0cnVlLCJleHAiOjE2ODU5NjA3MTksImlzQXBwQWRtaW4iOmZhbHNlLCJhdXRob3JpdGllcyI6WyJVU0VSIiwiQVVUSF9TWVNURU1fTUFOQUdFIl0sImp0aSI6IjZhNjJlYjM0LTJjYWEtNDc1Ni04OTI1LWNiMTk3NWMwNDNkZSIsImNsaWVudF9pZCI6ImFwaSJ9.hY8PXjs06K4hOt6R6ZSSG09ODKcG5BxgoJquHvexnBD_t2Yu4ydPJVubteadtOnXdRnzEx2rfiHfD3uw-6qpOEgNL6ZNIC2DqLYZpyGdalUI4IWXzMREBd2vQAY31-hIl_L2rHQOA3ndo8Nk3LO9aazGtC7kaIv2v_oB77P9oko'
const setDevToken = () => {
    if(process.env.NODE_ENV === 'development') {
        localStorage.setItem('token', token);
    }
}
//设置开发环境token
module.exports = setDevToken;