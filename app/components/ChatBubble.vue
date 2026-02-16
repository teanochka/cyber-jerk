<script setup lang="ts">
interface Props {
  message: string
  userName: string
  time: string
  backgroundColor?: string
}

withDefaults(defineProps<Props>(), {
  backgroundColor: 'bg-neutral-secondary-soft'
})
</script>

<template>  
<div class="flex items-start w-fit rounded-lg p-2 gap-2.5" :class="backgroundColor">
   <img class="w-8 h-8 rounded-full" src="/svg/profile.svg" alt="User image">
   <div class="flex flex-col gap-1 w-full max-w-[320px]">
      <div class="flex items-center space-x-1.5 rtl:space-x-reverse">
         <span class="text-sm font-semibold text-heading">{{ userName }}</span>
         <span class="text-sm text-body">{{ time }}</span>
      </div>
      <div class="flex flex-col leading-1.5 p-4 rounded-e-base rounded-es-base">
         <p class="text-sm text-body">{{ message }}</p>
      </div>
      <span class="text-sm text-body">Delivered</span>
   </div>
   <button id="dropdownMenuIconButton" data-dropdown-toggle="dropdownDots" data-dropdown-placement="bottom-start" class="inline-flex self-center items-center text-body hover:text-heading bg-neutral-primary box-border border border-transparent hover:bg-neutral-tertiary focus:ring-4 focus:ring-neutral-tertiary rounded-base p-1.5 focus:outline-none" type="button">
      <svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-width="3" d="M12 6h.01M12 12h.01M12 18h.01"/></svg>
   </button>
   <div id="dropdownDots" class="z-10 bg-neutral-primary-medium border border-default-medium rounded-base shadow-lg w-40 block hidden">
      <ul class="p-2 text-sm text-body font-medium" aria-labelledby="dropdownMenuIconButton">
         <li>
            <a href="#" class="block w-full p-2 hover:bg-neutral-tertiary-medium hover:text-heading rounded-md">Reply</a>
         </li>
         <li>
            <a href="#" class="block w-full p-2 hover:bg-neutral-tertiary-medium hover:text-heading rounded-md">Forward</a>
         </li>
         <li>
            <a href="#" class="block w-full p-2 hover:bg-neutral-tertiary-medium hover:text-heading rounded-md">Copy</a>
         </li>
         <li>
            <a href="#" class="block w-full p-2 hover:bg-neutral-tertiary-medium hover:text-heading rounded-md">Report</a>
         </li>
         <li>
            <a href="#" class="block w-full p-2 hover:bg-neutral-tertiary-medium hover:text-heading rounded-md">Delete</a>
         </li>
      </ul>
   </div>
</div>
</template>