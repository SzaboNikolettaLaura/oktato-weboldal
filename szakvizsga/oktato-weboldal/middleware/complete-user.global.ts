export default defineNuxtRouteMiddleware(async (to, from) => {
  const {userData} = useUserData();
  const {profileData} = await useProfileData(userData.value.id);
  if(profileData.value?.user?.role === 'diak') {
    if(profileData.value.initialScore === null) {
      if(to.name !== 'testpage') {
        return navigateTo('/testpage');
      }
      return;
    }
    if(!profileData.value.specialization && to.name !== 'users-id') {
        return navigateTo(`/users/${profileData.value?.id}`)
      }
    }
  })
  