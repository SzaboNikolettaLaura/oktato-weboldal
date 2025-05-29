export default defineNuxtRouteMiddleware((to, from) => {
  const {userData} = useUserData();
  // isAuthenticated() is an example method verifying if a user is authenticated
  if (userData.value.role === 'guest' && to.path !== '/register') {
    return navigateTo('/login')
  }
  console.log(to.path, userData.value)
  if (userData.value.role !== 'tanar' && to.path === '/lessonedit') {
    return navigateTo('/unavailable')
  }
  
  if(to.path === '/') {
    return navigateTo('/landing');
  }
})
