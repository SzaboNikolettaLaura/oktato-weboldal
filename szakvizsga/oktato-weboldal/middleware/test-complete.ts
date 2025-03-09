export default defineNuxtRouteMiddleware(async (to, from) => {
    const {userData} = useUserData();
    const {profileData} = await useProfileData(userData.value.id);
    if(profileData.value?.initialScore !== null) {
        return navigateTo('/landing');
    }
  })
  