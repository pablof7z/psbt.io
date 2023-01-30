<script>
    /** @type {String} */
    export let title;
    
    /** @type {Boolean} */
    export let isEnabled;

    /** @type {ChangeEventHandler} */
    export let onReset;
</script>

<div class="flex flex-col my-0 rounded-xl border-2
    {(isEnabled ? (
        "border-purple-700  dark:border-purple-800 " +
        "bg-purple-50 dark:bg-purple-1000 pb-0 " +
        "dark:text-white"
    ) : (
        "dark:border-gray-600 " +
        "dark:bg-dark-blue-900 " +
        "dark:text-gray-300"
    ))}">
    <div class="p-5 {(isEnabled ? 'md:pb-0' : '')}">
        <h3 class="text-2xl mb-5">
            {title}
        </h3>

        <slot></slot>
    </div>    

    <label class="w-full text-gray-500 px-5 py-1 text-sm flex flex-row items-center gap-2 rounded-b-xl {(isEnabled ? 'block' : 'hidden')}">
        <input id="" aria-describedby="comments-description" type="checkbox" class="hidden h-0 w-0 rounded border-gray-300 dark:text-blue-900 focus:ring-blue-900" checked={isEnabled} on:change={onReset}>
        <span>Reset</span>
    </label> 
</div>