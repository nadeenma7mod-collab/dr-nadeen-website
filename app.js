(() => {
  const $ = id => document.getElementById(id);
  const platforms = [
    {key:"tiktok",name:"TikTok",url:"https://www.tiktok.com/@nadeenmahmoud115",handle:"@nadeenmahmoud115",mark:"♪"},
    {key:"instagram",name:"Instagram",url:"https://www.instagram.com/dr_nadein/",handle:"@dr_nadein",mark:"◎"},
    {key:"facebook",name:"Facebook",url:"https://www.facebook.com/share/1DnS2SbeQ4/",handle:"Facebook",mark:"f"},
    {key:"youtube",name:"YouTube",url:"https://youtube.com/@nadeenmahmoud-p3x",handle:"@nadeenmahmoud-p3x",mark:"▶"}
  ];
  const fallbackProfile = {id:null,name:"د. نادين محمود",name_en:"Dr. Nadeen Mahmoud",bio:"أهلاً بكم في منصاتي الرسمية",bio_en:"Welcome to my official platforms",avatar_url:"temporary-doctor.svg",logo_url:"temporary-logo.svg",primary_color:"#456b5d",background_color:"#f6f5ef",text_color:"#24342e",card_style:"soft"};
  let profile = {...fallbackProfile}, accounts = platforms.map((p,i)=>({...p,title:p.name,url:p.url,username:p.handle,followers_count:"",account_avatar_url:"",sort_order:i}));
  let client = null, currentUser = null, language = "ar";
  const configured = window.SUPABASE_URL && !window.SUPABASE_URL.includes("YOUR-PROJECT") && window.SUPABASE_PUBLISHABLE_KEY && !window.SUPABASE_PUBLISHABLE_KEY.includes("YOUR_");
  if (configured && window.supabase) client = window.supabase.createClient(window.SUPABASE_URL,window.SUPABASE_PUBLISHABLE_KEY);

  function applyDesign(){
    document.documentElement.style.setProperty("--primary",profile.primary_color||"#456b5d");
    document.documentElement.style.setProperty("--bg",profile.background_color||"#f6f5ef");
    document.documentElement.style.setProperty("--ink",profile.text_color||"#24342e");
    document.body.dataset.cardStyle=profile.card_style||"soft";
  }
  function render(){
    applyDesign();
    $("doctorName").textContent=language==="ar"?profile.name:profile.name_en||profile.name;
    $("doctorBio").textContent=language==="ar"?profile.bio:profile.bio_en||profile.bio;
    $("brandName").textContent="DR. NADEEN";
    $("doctorAvatar").src=profile.avatar_url||"temporary-doctor.svg";
    $("brandLogo").src=profile.logo_url||"temporary-logo.svg";
    $("year").textContent=new Date().getFullYear();
    $("sectionTitle").textContent=language==="ar"?"تابعوني عبر منصاتي":"Find me on social media";
    $("eyebrowText").textContent=language==="ar"?"الصفحة الرسمية":"OFFICIAL PAGE";
    $("platformCount").textContent=`${accounts.filter(a=>a.is_active!==false).length.toString().padStart(2,"0")} PLATFORMS`;
    const host=$("socialLinks");host.replaceChildren();
    const active=accounts.filter(a=>a.is_active!==false).sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));
    if(!active.length){const e=document.createElement("div");e.className="empty-state";e.textContent=language==="ar"?"لا توجد روابط ظاهرة حاليًا":"No public links yet";host.append(e)}
    active.forEach(a=>{
      const link=document.createElement("a");link.className="social-card";link.href=a.url||"#";link.target="_blank";link.rel="noopener noreferrer";
      const img=a.account_avatar_url||"";
      if(img){const pic=document.createElement("img");pic.className="account-avatar";pic.src=img;pic.alt="";link.append(pic)}
      else{const mark=document.createElement("div");mark.className="platform-mark";mark.textContent=(platforms.find(p=>p.key===a.platform)||{}).mark||"↗";link.append(mark)}
      const info=document.createElement("div");info.className="account-info";
      const title=document.createElement("p");title.className="platform-name";title.textContent=a.title||a.platform||"Social";
      const handle=document.createElement("div");handle.className="account-handle";handle.textContent=a.username||"";
      info.append(title,handle);
      if(a.followers_count){const f=document.createElement("div");f.className="followers";f.textContent=`${a.followers_count} ${a.platform==="youtube"?(language==="ar"?"مشترك":"subscribers"):(language==="ar"?"متابع":"followers")}`;info.append(f)}
      const arrow=document.createElement("span");arrow.className="card-arrow";arrow.textContent=language==="ar"?"←":"→";
      link.append(info,arrow);host.append(link);
    });
  }
  async function loadPublic(){
    if(!client){render();return}
    try{
      const {data:p,error:pe}=await client.from("profiles").select("*").limit(1).maybeSingle();
      if(!pe&&p)profile={...profile,...p};
      const {data:l,error:le}=await client.from("links").select("*").eq("is_active",true).order("sort_order");
      if(!le&&l&&l.length)accounts=l.map(x=>({...x,platform:x.platform||"social",title:x.title,username:x.username||"",followers_count:x.followers_count||"",account_avatar_url:x.account_avatar_url||""}));
    }catch(e){console.warn(e)}
    render();
  }
  function show(view){["publicPage","authPage","dashboard"].forEach(id=>$(id).classList.toggle("hidden",id!==view));}
  $("langToggle").onclick=()=>{language=language==="ar"?"en":"ar";document.documentElement.lang=language;document.documentElement.dir=language==="ar"?"rtl":"ltr";$("langToggle").innerHTML=language==="ar"?"EN <span>↗</span>":"AR <span>↗</span>";render()};
  $("adminEntry").onclick=()=>{show("authPage");if(!client)$("authMessage").textContent="يجب إعداد Supabase أولاً في ملف config.js."};
  $("backPublic").onclick=()=>show("publicPage");
  $("loginButton").onclick=async()=>{
    if(!client){$("authMessage").textContent="إعداد Supabase غير مكتمل. راجعي ملف config.js.";return}
    $("loginButton").disabled=true;$("authMessage").textContent="جارٍ التحقق...";
    const {data,error}=await client.auth.signInWithPassword({email:$("loginEmail").value.trim(),password:$("loginPassword").value});
    if(error){$("authMessage").textContent="تعذر تسجيل الدخول. راجعي البريد وكلمة المرور."; $("loginButton").disabled=false;return}
    const {data:allowed,error:checkError}=await client.rpc("is_site_admin");
    if(checkError||allowed!==true){await client.auth.signOut();$("authMessage").textContent="هذا الحساب غير مصرح له بإدارة الموقع.";$("loginButton").disabled=false;return}
    currentUser=data.user;await loadAdminData();show("dashboard");$("loginButton").disabled=false;
  };
  $("logoutButton").onclick=async()=>{if(client)await client.auth.signOut();currentUser=null;show("publicPage")};
  document.querySelectorAll(".nav-item").forEach(btn=>btn.onclick=()=>{document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b===btn));document.querySelectorAll(".tab-panel").forEach(p=>p.classList.add("hidden"));$("tab-"+btn.dataset.tab).classList.remove("hidden")});
  async function loadAdminData(){
    $("editName").value=profile.name||"";$("editNameEn").value=profile.name_en||"";$("editBio").value=profile.bio||"";$("editBioEn").value=profile.bio_en||"";
    $("primaryColor").value=profile.primary_color||"#456b5d";$("backgroundColor").value=profile.background_color||"#f6f5ef";$("textColor").value=profile.text_color||"#24342e";$("cardStyle").value=profile.card_style||"soft";
    if(client){const {data}=await client.from("links").select("*").order("sort_order");if(data&&data.length)accounts=data.filter(x=>["tiktok","instagram","facebook","youtube"].includes(x.platform)).map(x=>({...x,platform:x.platform||"social"}))}
    renderAccountEditors();
  }
  function renderAccountEditors(){
    const root=$("accountEditors");root.replaceChildren();
    accounts.forEach((a,i)=>{
      const wrap=document.createElement("div");wrap.className="account-editor";const h=document.createElement("h3");h.textContent=a.title||a.platform;wrap.append(h);
      const grid=document.createElement("div");grid.className="account-fields";
      const fields=[["اسم العرض","title"],["رابط الحساب","url"],["اسم المستخدم","username"],["عدد المتابعين / المشتركين","followers_count"],["رابط صورة الحساب","account_avatar_url"],["ترتيب الظهور","sort_order"]];
      fields.forEach(([label,key])=>{const l=document.createElement("label");l.textContent=label;const input=document.createElement("input");input.value=a[key]??"";input.dataset.index=i;input.dataset.key=key;if(key==="sort_order")input.type="number";if(key==="url"||key==="account_avatar_url")input.type="url";l.append(input);grid.append(l)});
      const activeLabel=document.createElement("label");activeLabel.textContent="إظهار الحساب";const checkbox=document.createElement("input");checkbox.type="checkbox";checkbox.checked=a.is_active!==false;checkbox.dataset.index=i;checkbox.dataset.key="is_active";activeLabel.append(checkbox);grid.append(activeLabel);wrap.append(grid);root.append(wrap);
    });
  }
  async function uploadImage(file,path){
    if(!file)return null;
    const ext=(file.name.split(".").pop()||"jpg").toLowerCase().replace(/[^a-z0-9]/g,"");
    const name=`${path}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const {error}=await client.storage.from("site-assets").upload(name,file,{upsert:true,contentType:file.type});
    if(error)throw error;
    const {data}=client.storage.from("site-assets").getPublicUrl(name);return data.publicUrl;
  }
  async function saveProfile(){
    try{
      profile.name=$("editName").value.trim();profile.name_en=$("editNameEn").value.trim();profile.bio=$("editBio").value.trim();profile.bio_en=$("editBioEn").value.trim();
      const av=$("avatarUpload").files[0],logo=$("logoUpload").files[0];if(av)profile.avatar_url=await uploadImage(av,"profile");if(logo)profile.logo_url=await uploadImage(logo,"brand");
      const payload={...profile,updated_at:new Date().toISOString()};delete payload.id;
      const {data:existing,error:lookupError}=await client.from("profiles").select("id").limit(1).maybeSingle();
      if(lookupError)throw lookupError;
      const result=existing
        ?await client.from("profiles").update(payload).eq("id",existing.id).select("id").maybeSingle()
        :await client.from("profiles").insert(payload).select("id").maybeSingle();
      if(result.error)throw result.error;
      if(!result.data)throw new Error("لم يتم تحديث سجل الملف الشخصي. تحققي من صلاحيات RLS.");
      $("dashboardMessage").textContent="تم حفظ الملف الشخصي.";await loadPublic();
    }catch(e){$("dashboardMessage").textContent="لم يتم الحفظ: "+(e.message||"تحققي من إعدادات التخزين والصلاحيات.");}
  }
  $("saveProfile").onclick=saveProfile;
  $("saveAccounts").onclick=async()=>{
    try{
      document.querySelectorAll("#accountEditors input").forEach(input=>{const a=accounts[Number(input.dataset.index)];a[input.dataset.key]=input.type==="checkbox"?input.checked:input.type==="number"?Number(input.value):input.value.trim()});
      for(const a of accounts){
        const payload={title:a.title,url:a.url,icon:a.platform,platform:a.platform,username:a.username,followers_count:String(a.followers_count||""),account_avatar_url:a.account_avatar_url||"",sort_order:Number(a.sort_order)||0,is_active:a.is_active!==false,updated_at:new Date().toISOString()};
        let result=a.id
          ?await client.from("links").update(payload).eq("id",a.id).select("id").maybeSingle()
          :await client.from("links").insert(payload).select("id").maybeSingle();
        if(result.error)throw result.error;
        if(!result.data)throw new Error("لم يتم تحديث حساب "+(a.title||a.platform)+". تحققي من صلاحيات RLS.");
      }
      $("dashboardMessage").textContent="تم حفظ بيانات المنصات.";await loadPublic();await loadAdminData();
    }catch(e){$("dashboardMessage").textContent="لم يتم الحفظ: "+(e.message||"راجعي إعدادات قاعدة البيانات.");}
  };
  $("saveDesign").onclick=async()=>{
    try{
      profile.primary_color=$("primaryColor").value;profile.background_color=$("backgroundColor").value;profile.text_color=$("textColor").value;profile.card_style=$("cardStyle").value;
      const payload={...profile,updated_at:new Date().toISOString()};delete payload.id;
      const {data:existing,error:lookupError}=await client.from("profiles").select("id").limit(1).maybeSingle();
      if(lookupError)throw lookupError;
      const result=existing
        ?await client.from("profiles").update(payload).eq("id",existing.id).select("id").maybeSingle()
        :await client.from("profiles").insert(payload).select("id").maybeSingle();
      if(result.error)throw result.error;
      if(!result.data)throw new Error("لم يتم تحديث سجل التصميم. تحققي من صلاحيات RLS.");
      $("dashboardMessage").textContent="تم حفظ التصميم.";
      await loadPublic();await loadAdminData();
    }catch(e){$("dashboardMessage").textContent="تعذر حفظ التصميم: "+(e.message||"تحققي من قاعدة البيانات.");}
  };
  loadPublic();
  if(client)client.auth.getSession().then(async({data})=>{if(data.session){const {data:ok}=await client.rpc("is_site_admin");if(ok){currentUser=data.session.user;await loadAdminData();show("dashboard")}}});
})();