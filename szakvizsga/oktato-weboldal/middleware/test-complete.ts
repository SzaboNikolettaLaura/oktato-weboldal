export default defineNuxtRouteMiddleware(async (to, from) => {
    const {profileData} = await useProfileData();
    if(profileData.value?.initialScore !== null) {
        return navigateTo('/landing');
    }
  })
  