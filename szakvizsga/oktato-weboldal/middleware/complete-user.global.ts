export default defineNuxtRouteMiddleware(async (to, from) => {
  const {profileData} = await useProfileData();
  console.log(profileData.value);
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
  