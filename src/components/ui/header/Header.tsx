import React, { useState } from 'react'
import { Button } from '../button';
import { Menu, Search } from 'lucide-react';
import { Input } from '../input';
import { DASHBOARD_TEXTS } from '@/lib/constants/text';
import { Notifications } from './Notification';
import { UserDropdown } from './UserDropDown';


interface headerProps {
    toggleMobileSidebar: () => void;
}

function Header({ toggleMobileSidebar }: headerProps) {
    const [ searchQuery, setSearchQuery ] = useState('');
  return (
    <header className='sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white px-6 shadow-sm'>
        {/* Mobile Menu Button  */}
        <Button variant={'ghost'} size={'icon'} className='lg:hidden' onClick={toggleMobileSidebar} >
            <Menu />
        </Button>

        {/* Search Bar  */}
        <div className='flex flex-1 items-center gap-4'>
            <div className='relative flex-1 max-w-xl'>
                <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
                <Input type='search' placeholder={DASHBOARD_TEXTS.header.searchPlaceholder} className='w-full pl-10' value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />    
        
            </div>  
        </div>

        {/* Right Side Actions  */}
        <div className='flex items-center gap-3'>
            <Notifications />
            <div className='hidden md:block'>
                <div className='flex flex-col'>
                <span className=' text-sm font-medium text-gray-900 '>
                    {DASHBOARD_TEXTS.header.welcome} Admin
                </span>
                    <span className='text-xs text-gray-500'>Administrator</span>
                </div>
            </div>  
            <UserDropdown />
        </div>

    </header>
  )
}

export default Header