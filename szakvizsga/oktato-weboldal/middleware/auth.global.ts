export default defineNuxtRouteMiddleware((to, from) => {
  const {userData} = useUserData();
  
  // Allow navigation between login and registration
  if ((to.path === '/login' || to.path === '/register') && (from.path === '/login' || from.path === '/register')) {
    return;
  }
  
  // isAuthenticated() is an example method verifying if a user is authenticated
  if (userData.value.role === 'guest' && to.path !== '/login' && to.path !== '/register') {
    return navigateTo('/login')
  }
  if (userData.value.role !== 'tanar' && to.path === '/lessonedit') {
    return navigateTo('/unavailable')
  }
  
  if(to.path === '/') {
      return navigateTo('/landing');
  }
}) 