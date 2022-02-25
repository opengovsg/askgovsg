import {
  Button,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
} from '@chakra-ui/react'
import { BiSortAlt2 } from 'react-icons/bi'
import {
  QuestionsDisplayState,
  QuestionSortState,
  questionSortStates,
} from '../Questions/questions'

interface SortQuestionsMenuProps {
  questionsDisplayState: QuestionsDisplayState
  sortState: QuestionSortState
  setSortState: (sortState: QuestionSortState) => void
}

export const SortQuestionsMenu = ({
  questionsDisplayState,
  sortState,
  setSortState,
}: SortQuestionsMenuProps): JSX.Element => {
  return (
    <Menu matchWidth autoSelect={false} offset={[0, 0]}>
      {() => (
        <>
          <MenuButton
            as={Button}
            variant="outline"
            borderColor="secondary.700"
            color="secondary.700"
            borderRadius="4px"
            borderWidth="1px"
            w={{ base: '100%', sm: '171px' }}
            textStyle="body-1"
            textAlign="left"
            d={{
              base: questionsDisplayState.value === 'all' ? 'block' : 'none',
            }}
          >
            <Flex justifyContent="space-between" alignItems="center">
              <Text textStyle="body-1">{sortState.label}</Text>
              <BiSortAlt2 />
            </Flex>
          </MenuButton>
          <MenuList
            minW={0}
            borderRadius={0}
            borderWidth={0}
            boxShadow="0px 0px 10px rgba(216, 222, 235, 0.5)"
          >
            {questionSortStates.map(({ value, label }, i) => (
              <MenuItem
                key={i}
                h="48px"
                ps={4}
                textStyle={sortState.value === value ? 'subhead-1' : 'body-1'}
                fontWeight={sortState.value === value ? '500' : 'normal'}
                letterSpacing="-0.011em"
                bg={sortState.value === value ? 'primary.200' : 'white'}
                _hover={
                  sortState.value === value
                    ? { bg: 'primary.200' }
                    : { bg: 'primary.100' }
                }
                onClick={() => {
                  setSortState(questionSortStates[i])
                }}
              >
                {label}
              </MenuItem>
            ))}
          </MenuList>
        </>
      )}
    </Menu>
  )
}
