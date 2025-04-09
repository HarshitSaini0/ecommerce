import { createSlice } from "@reduxjs/toolkit";


const initialSlice = {
    status: false,
    userData: {
      
    },
    loading: false,
    error: null
    

};

const authSlice = createSlice({
    name: 'auth',
    initialState: initialSlice,
    reducers:{
        login: (state, action) => {
            state.status = true;
            state.userData = {
                ...action.payload.userData,
                likedPostsCount: action.payload.likedPostsCount, // Store likedPostsCount
            };

        },
        logout: (state) => {
            state.status = false;
            state.userData = null;
        }
    }
});


export default authSlice.reducer;
export const { login, logout } = authSlice.actions;
