"use client";



import { forwardRef } from "react";

import Link from "next/link";

import { usePathname } from "next/navigation";

import AiAssistantPanel from "@/components/AiAssistantPanel";

import {

  commandCenterAsideClassName,

  commandCenterHeaderClassName,

  commandCenterMobileCloseClassName,

  commandCenterNavActiveClassName,

  commandCenterNavIdleClassName,

  commandCenterTitleClassName,

} from "@/lib/dashboardStyles";

import { SIDEBAR_NAV_ITEMS } from "@/lib/navigation";



interface AppSidebarProps {

  className?: string;

  id?: string;

  onMobileClose?: () => void;

}



const AppSidebar = forwardRef<HTMLElement, AppSidebarProps>(function AppSidebar(

  { className = "", id, onMobileClose },

  ref

) {

  const pathname = usePathname();



  return (

    <aside

      ref={ref}

      id={id}

      aria-label="Command center"

      className={`${commandCenterAsideClassName} ${className}`}

    >

      <div className={commandCenterHeaderClassName}>

        <p className={commandCenterTitleClassName}>Command Center</p>

        {onMobileClose && (

          <button

            type="button"

            aria-label="Close Command Center"

            onClick={onMobileClose}

            className={commandCenterMobileCloseClassName}

          >

            <span aria-hidden="true">&times;</span>

          </button>

        )}

      </div>



      <nav className="shrink-0 px-3 py-2">

        <ul className="space-y-0.5">

          {SIDEBAR_NAV_ITEMS.map((item) => {

            const isActive = pathname === item.href;



            return (

              <li key={item.href}>

                <Link

                  href={item.href}

                  aria-current={isActive ? "page" : undefined}

                  onClick={onMobileClose}

                  className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${

                    isActive ? commandCenterNavActiveClassName : commandCenterNavIdleClassName

                  }`}

                >

                  {item.label}

                </Link>

              </li>

            );

          })}

        </ul>

      </nav>



      <AiAssistantPanel />

    </aside>

  );

});



export default AppSidebar;

