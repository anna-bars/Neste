export const ProfileNavigationSection = () => {
  return (
    <div>
      <div className="flex items-center gap-3 mt-4 mb-2 sm:mt-0 lg:hidden">
        <img
          src="/quotes/header-ic.svg"
          alt=""
          className="w-[22px] h-[22px] sm:w-6 sm:h-6"
        />
        <h2 className="font-normal text-[18px] sm:text-[26px]">Profile & Settings</h2>
      </div> 
      
      <div className="hidden lg:block">
        <h1 className="[font-family:'Montserrat-Regular',Helvetica] font-normal text-black text-[32px] tracking-[0.64px] leading-tight">
          Profile & Settings
        </h1>
        <p className="[font-family:'Montserrat-Regular',Helvetica] font-normal text-[#c7c7c7] text-sm tracking-[0.28px] mt-1">
          Manage your personal information, security, notifications, and billing
        </p>
      </div>
    </div>
  )
}