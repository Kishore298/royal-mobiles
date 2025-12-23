const USER_DETAILS_KEY = 'userDetails';

export const saveUserDetails = (details) => {
  try {
    localStorage.setItem(USER_DETAILS_KEY, JSON.stringify(details));
  } catch (error) {
    console.error('Error saving user details to localStorage:', error);
  }
};

export const getUserDetails = () => {
  try {
    const details = localStorage.getItem(USER_DETAILS_KEY);
    return details ? JSON.parse(details) : null;
  } catch (error) {
    console.error('Error getting user details from localStorage:', error);
    return null;
  }
};

export const clearUserDetails = () => {
  try {
    localStorage.removeItem(USER_DETAILS_KEY);
  } catch (error) {
    console.error('Error clearing user details from localStorage:', error);
  }
}; 