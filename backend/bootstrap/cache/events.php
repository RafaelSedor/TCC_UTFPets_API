<?php return array (
  'App\\Providers\\EventServiceProvider' => 
  array (
    'Illuminate\\Auth\\Events\\Registered' => 
    array (
      0 => 'Illuminate\\Auth\\Listeners\\SendEmailVerificationNotification',
    ),
    'App\\Events\\SharedPetInvited' => 
    array (
      0 => 'App\\Listeners\\SendSharedPetNotification@handleInvited',
    ),
    'App\\Events\\SharedPetAccepted' => 
    array (
      0 => 'App\\Listeners\\SendSharedPetNotification@handleAccepted',
    ),
    'App\\Events\\SharedPetRoleChanged' => 
    array (
      0 => 'App\\Listeners\\SendSharedPetNotification@handleRoleChanged',
    ),
    'App\\Events\\SharedPetRemoved' => 
    array (
      0 => 'App\\Listeners\\SendSharedPetNotification@handleRemoved',
    ),
  ),
  'Illuminate\\Foundation\\Support\\Providers\\EventServiceProvider' => 
  array (
    'App\\Events\\SharedPetInvited' => 
    array (
      0 => 'App\\Listeners\\SendSharedPetNotification@handleInvited',
    ),
    'App\\Events\\SharedPetAccepted' => 
    array (
      0 => 'App\\Listeners\\SendSharedPetNotification@handleAccepted',
    ),
    'App\\Events\\SharedPetRoleChanged' => 
    array (
      0 => 'App\\Listeners\\SendSharedPetNotification@handleRoleChanged',
    ),
    'App\\Events\\SharedPetRemoved' => 
    array (
      0 => 'App\\Listeners\\SendSharedPetNotification@handleRemoved',
    ),
  ),
);