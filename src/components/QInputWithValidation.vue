<template>
  <q-input
    class="col-4"
    outlined
    v-model="value"
    :error-message="errorMessage"
    :error="!!errorMessage"
    ><template v-slot:prepend> <q-icon :name="icon" /> </template
  ></q-input>
</template>

<script>
import { useField } from 'vee-validate'

export default {
  name: 'QInputWithValidation',
  props: {
    name: {
      type: String,
      required: true
    },
    icon: {
      type: String
    }
  },
  setup(props) {
    const { errorMessage, value } = useField(props.name)

    return {
      errorMessage,
      value
    }
  }
}
</script>
