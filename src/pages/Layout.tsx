import React, {useState} from "react";
import {Dialog, DialogBackdrop, DialogPanel, TransitionChild} from "@headlessui/react";
import {Outlet, useLocation} from "react-router-dom";
import {FiMenu} from "react-icons/fi";
import {IoCloseOutline} from "react-icons/io5";
import {IconType} from "react-icons";
import {MdOutlineLightbulb} from "react-icons/md";
import {LuLayoutDashboard} from "react-icons/lu";
import {PiBooks} from "react-icons/pi";
import {RiSettings3Line} from "react-icons/ri";

const navigation: { name: string, icon: IconType, href: string }[] = [
    {name: "Dashboard", icon: LuLayoutDashboard, href: "/"},
    {name: "Ideas", icon: MdOutlineLightbulb, href: "/ideas"},
    {name: "Projects", icon: PiBooks, href: "/projects"},
    {name: "Settings", icon: RiSettings3Line, href: "/settings"}
];

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(" ");
}

export default function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const location = useLocation().pathname;

    return (
        <>
            <div>
                <Dialog open={sidebarOpen} onClose={setSidebarOpen} className="relative z-50 lg:hidden">
                    <DialogBackdrop
                        transition
                        className="fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ease-linear data-[closed]:opacity-0"
                    />

                    <div className="fixed inset-0 flex">
                        <DialogPanel
                            transition
                            className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-[closed]:-translate-x-full"
                        >
                            <TransitionChild>
                                <div
                                    className="absolute left-full top-0 flex w-16 justify-center pt-5 duration-300 ease-in-out data-[closed]:opacity-0">
                                    <button type="button" onClick={() => setSidebarOpen(false)}
                                            className="-m-2.5 p-2.5">
                                        <span className="sr-only">Close sidebar</span>
                                        <IoCloseOutline aria-hidden="true" className="h-6 w-6 text-white"/>
                                    </button>
                                </div>
                            </TransitionChild>
                            <div
                                className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 pb-2 ring-1 ring-white/10">
                                <div className="flex">
                                    Storied
                                </div>
                                <nav className="flex flex-1 flex-col">
                                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                                        <li>
                                            <ul role="list" className="-mx-2 space-y-1">
                                                {navigation.map((item) => (
                                                    <li key={item.name}>
                                                        <a
                                                            href={item.href}
                                                            className={classNames(
                                                                item.href.split("/")[1] === location.split("/")[1]
                                                                    ? "bg-gray-800 text-white"
                                                                    : "text-gray-400 hover:bg-gray-800 hover:text-white",
                                                                "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6",
                                                            )}
                                                        >
                                                            <item.icon aria-hidden="true" className="h-6 w-6 shrink-0"/>
                                                            {item.name}
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        </DialogPanel>
                    </div>
                </Dialog>

                {/* Static sidebar for desktop */}
                <div
                    className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-20 lg:overflow-y-auto lg:bg-gray-900 lg:pb-4">
                    <div className="flex h-16 shrink-0 items-center justify-center">
                        S
                    </div>
                    <nav className="mt-8">
                        <ul role="list" className="flex flex-col items-center space-y-1">
                            {navigation.map((item) => (
                                <li key={item.name}>
                                    <a
                                        href={item.href}
                                        className={classNames(
                                            item.href.split("/")[1] === location.split("/")[1] ? "bg-gray-800 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white",
                                            "group flex gap-x-3 rounded-md p-3 text-sm font-semibold leading-6",
                                        )}
                                    >
                                        <item.icon aria-hidden="true" className="h-6 w-6 shrink-0"/>
                                        <span className="sr-only">{item.name}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
                <div
                    className="sticky top-0 z-40 flex items-center gap-x-6 bg-gray-900 px-4 py-4 shadow-sm sm:px-6 lg:hidden h-14"
                    id="menu-bar">
                    <button type="button" onClick={() => setSidebarOpen(true)}
                            className="-m-2.5 p-2.5 text-gray-400 lg:hidden">
                        <span className="sr-only">Open sidebar</span>
                        <FiMenu aria-hidden="true" className="h-6 w-6"/>
                    </button>
                    <div
                        className="flex-1 text-sm font-semibold leading-6 text-white">{navigation.find(item => item.href.split("/")[1] === location.split("/")[1]).name}</div>
                </div>
                <main className="lg:pl-20">
                    <div className="h-[calc(100vh-56px)] overflow-clip lg:h-screen"><Outlet/></div>
                </main>
                {/*<aside*/}
                {/*    className="fixed inset-y-0 left-20 hidden w-96 overflow-y-auto border-r border-gray-200 px-4 py-6 sm:px-6 lg:px-8 xl:block">*/}
                {/*    /!* Secondary column (hidden on smaller screens) *!/*/}
                {/*</aside>*/}
            </div>
        </>
    )
        ;
}