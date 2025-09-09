import * as Yup from 'yup'

export const UserSchema = Yup.object().shape({
  name: Yup.string().min(2, 'Too Short!').max(50, 'Too Long!').required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  type_membership: Yup.string().required('Type membership is required'),
  bio: Yup.string().min(2, 'Too Short!').max(100, 'Too Long!').required('Bio is required')
})
