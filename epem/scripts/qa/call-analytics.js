(async()=>{
 const login=await fetch('http://localhost:4000/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'admin@epem.local',password:'admin123'})});
 const j=await login.json();
 const t=j.accessToken; const res=await fetch('http://localhost:4000/analytics/metrics',{headers:{Authorization:`Bearer ${t}`}});
 console.log(res.status);
 console.log(await res.text());
})();
