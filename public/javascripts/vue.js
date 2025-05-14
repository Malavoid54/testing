 const { createApp, ref } = Vue;

createApp({
    setup() {
        // Login / signup input validation
        const username = ref('');
        const password = ref('');
        const user_error_mes = ref('');
        const pw_error_mes = ref('');

        // Login / signup database validation
        const validUser = ref(false);
        const validPw = ref(false);
        const allowContinue = ref(false);

        async function checkUsername(mode) {
            try {
                const encodedUsername = encodeURIComponent(username.value);
                const res = await fetch(`/search-user?Username=${encodedUsername}`);
                const userExist = await res.json();
                if (!userExist) {
                    if (mode === "signup") {
                        if (username.value.endsWith(' ')) {
                            user_error_mes.value = 'Username cannot end with a space.';
                            validUser.value = false;
                        } else {
                            user_error_mes.value = '';
                            validUser.value = true;
                        }
                    } else {
                        user_error_mes.value = 'User does not exist.';
                        validUser.value = false;
                    }
                } else if (userExist) {
                    if (mode === "signup") {
                        user_error_mes.value = 'Username already taken.';
                        validUser.value = false;
                    } else {
                        user_error_mes.value = '';
                        validUser.value = true;
                    }
                }
            } catch(err) {
                user_error_mes.value = 'Failed to get user. Please try again.';
                validUser.value = false;
            }
        }
        function passwordValidation() {
            // Password input validation for signup
            if (password.value.includes(' ')) {
                pw_error_mes.value = 'Password cannot contain spaces.';
                validPw.value = false;
            } else if (password.value === "") {
                pw_error_mes.value = 'Password is required.';
                validPw.value = false;
            } else {
                pw_error_mes.value = '';
                validPw.value = true;
            }
        }
        function usernameValidation(mode) {
            // Username input validation for signup & login
            if (username.value === "") {
                user_error_mes.value = 'Username is required.';
                validUser.value = false;
            } else {
                checkUsername(mode);
            }
        }
        function checkInputValidity() {
            if (validUser.value === true && validPw.value === true) {
                allowContinue.value = true;
            } else {
                allowContinue.value = false;
            }
        }

        return {
            username,
            user_error_mes,
            usernameValidation,
            passwordValidation,
            password,
            pw_error_mes,
            checkInputValidity,
            allowContinue
        };
    }
}).mount('#app');
