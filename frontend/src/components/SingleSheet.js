import {
  Box,
  Text,
  Table,
  Tbody,
  Tr,
  Td,
  Th,
  Thead,
  TableContainer,
  Spinner,
  FormControl,
  Input,
  IconButton,
  useToast,
  Button,
  Stack,
} from "@chakra-ui/react";
import {
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import "./styles.css";
import { getSender, getSenderFull } from "../config/ChatLogics";
import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowBackIcon } from "@chakra-ui/icons";
import ProfileModal from "./miscellaneous/ProfileModal";
import ScrollableChat from "./ScrollableChat";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";

import io from "socket.io-client";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import { ChatState } from "../Context/ChatProvider";

import CueChangeModal from "./miscellaneous/CueChangeModal";

const ENDPOINT = "http://localhost:5000";
var socket, selectedChatCompare;

const SingleSheet = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");

  const [newItemNum, setNewItemNum] = useState(0);
  const [newCategory, setNewCategory] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newEstTime, setNewEstTime] = useState("");
  const [newNotes, setNewNotes] = useState("");

  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const toast = useToast();

  const [showModal, setShowModal] = useState(false); // State to control modal visibility
  const [selectedCue, setSelectedCue] = useState(null); // State to store selected cue

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  const { selectedChat, setSelectedChat, user, notification, setNotification } =
    ChatState();

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoading(true);

      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );
      setMessages(data);
      setLoading(false);

      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage) {
      socket.emit("stop typing", selectedChat._id);
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        setNewMessage("");
        const { data } = await axios.post(
          "/api/message",
          {
            itemNum: newItemNum,
            estTime: newEstTime,
            content: newMessage,
            category: newCategory,
            location: newLocation,
            notes: newNotes,
            chatId: selectedChat,
          },
          config
        );
        socket.emit("new message", data);
        setMessages([...messages, data]);
      } catch (error) {
        toast({
          title: "Error Occured!",
          description: "Failed to send the Message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };

  useEffect(
    () => {
      socket = io(ENDPOINT);
      socket.emit("setup", user);
      socket.on("connected", () => setSocketConnected(true));
      socket.on("typing", () => setIsTyping(true));
      socket.on("stop typing", () => setIsTyping(false));

      // return () => {
      //   socket.disconnect(); // Clean up socket connection on component unmount
      // };
    },
    [
      /*user*/
    ]
  );

  // useEffect(() => {
  //   fetchMessages();
  // }, [selectedChat, fetchAgain]);

  useEffect(() => {
    fetchMessages();

    selectedChatCompare = selectedChat;
    // eslint-disable-next-line
  }, [selectedChat]);

  // useEffect(() => {
  //   socket.on("message received", (newMessageReceived) => {
  //     setMessages([...messages, newMessageReceived]);
  //   });
  // });

  useEffect(() => {
    socket.on("message recieved", (newMessageRecieved) => {
      if (
        !selectedChatCompare || // if chat is not selected or doesn't match current chat
        selectedChatCompare._id !== newMessageRecieved.chat._id
      ) {
        if (!notification.includes(newMessageRecieved)) {
          setNotification([newMessageRecieved, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, newMessageRecieved]);
      }
    });
  }, [messages]);

  useEffect(() => {
    socket.on("message deleted", (messageId) => {
      setMessages(messages.filter((message) => message._id !== messageId));
      setFetchAgain(!fetchAgain);
    });
  });

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!istyping) {
      setIsTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && istyping) {
        socket.emit("stop typing", selectedChat._id);
        setIsTyping(false);
      }
    }, timerLength);
  };

  const addCue = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior

    socket.emit("stop typing", selectedChat._id);
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      setNewMessage("");
      setNewItemNum("");
      setNewCategory("");
      setNewLocation("");
      setNewEstTime("");
      setNewNotes("");

      const { data } = await axios.post(
        "/api/message",
        {
          // Pass the values of all the fields to the backend
          itemNum: newItemNum,
          estTime: newEstTime,
          content: newMessage, // Assuming newMessage is the message content
          category: newCategory,
          location: newLocation,
          notes: newNotes,
          chatId: selectedChat,
        },
        config
      );
      socket.emit("new message", data);
      setMessages([...messages, data]);
      // Clear all the input fields after successfully adding the cue
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: "Failed to add the Cue",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  // Inside useEffect hook to handle the socket event
  useEffect(() => {
    socket.on("cue status update", ({ messageId, status }) => {
      // Find the message by ID and update its status
      setMessages(
        messages.map((message) => {
          if (message._id === messageId) {
            return { ...message, status };
          }
          return message;
        })
      );
    });
  }, [messages]); // Make sure to include 'messages' in the dependency array

  const handleCueClick = (message) => {
    setSelectedCue(message._id); // Set the selected message ID
    setShowModal(true); // Open the modal
  };

  const handleUpdateStatus = async (status) => {
    console.log("Updating cue status:", status);
    console.log("Updating message:", selectedCue);

    if (!selectedCue) {
      console.error("No cue selected");
      return;
    }

    try {
      const response = await fetch(
        `/api/message/${selectedCue}/status/${status}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update message status: ${response.status}`);
      }

      const updatedMessage = await response.json();
      console.log("Message status updated:", updatedMessage);

      // Emit a socket event to notify other clients about the status change
      socket.emit("cue status update", { messageId: selectedCue, status });
      // Emit cue status update event to the server
      // console.log(`Cue status update emitted: Message ID ${messageId}, Status ${status}`);
      console.log(
        `cue status update emitted: Message ID`,
        { messageId: selectedCue },
        `Status`,
        { status }
      );

      // Optionally, you can also update the local state immediately for better user experience
      const updatedMessages = messages.map((message) => {
        if (message._id === selectedCue) {
          return { ...message, status };
        }
        return message;
      });
      setMessages(updatedMessages);
    } catch (error) {
      console.error("Error updating message status:", error);
    }

    setSelectedCue(null); // Reset the selected message ID
  };

  const handleDeleteMessage = async () => {
    console.log("Deleting message:", selectedCue);

    if (!selectedCue) {
      console.error("No cue selected");
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      socket.emit("delete message", selectedCue);
      const response = await axios.delete(
        `/api/message/${selectedCue}`,
        config
      );

      if (response.status === 200) {
        // Remove the deleted message from the local state or update it accordingly
        // For example, if 'messages' is an array of messages, you can filter out the deleted message
        setMessages(messages.filter((message) => message._id !== selectedCue));

        // Emit a socket event to notify other clients about the deletion

        // Show a success message to the user
        toast({
          title: "Cue Deleted",
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      } else {
        throw new Error(`Failed to delete message: ${response.status}`);
      }
    } catch (error) {
      console.error("Error deleting message:", error);

      // Show an error message to the user
      toast({
        title: "Error Occurred!",
        description: "Failed to delete the message",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }

    setSelectedCue(null); // Reset the selected message I
  };

  const handleCopyMessageId = () => {
    const textarea = document.createElement("textarea");
    textarea.value = selectedCue;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    setSelectedCue(null);
    toast({
      title: "Cue ID copied",
      status: "success",
      duration: 5000,
      isClosable: true,
      position: "bottom",
    });
  };

  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Work sans"
            d="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
          >
            <IconButton
              d={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />
            {messages &&
              (!selectedChat.isGroupChat ? (
                <>
                  {getSender(user, selectedChat.users)}
                  <ProfileModal
                    user={getSenderFull(user, selectedChat.users)}
                  />
                </>
              ) : (
                <>
                  Runsheet:
                  {selectedChat.chatName.toUpperCase()}
                  <UpdateGroupChatModal
                    fetchMessages={fetchMessages}
                    fetchAgain={fetchAgain}
                    setFetchAgain={setFetchAgain}
                  />
                </>
              ))}
          </Text>
          <Box
            d="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            bg="#E8E8E8"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            <Table>
              <Thead>
                <Tr>
                  <Th>#</Th>
                  <Th>Duration</Th>
                  <Th>Action</Th>
                  <Th>Category</Th>
                  <Th>Notes</Th>
                </Tr>
              </Thead>
            </Table>
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <Box overflowY="auto" flexGrow={1}>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>#</Th>
                      <Th>Duration</Th>
                      <Th>Action</Th>
                      <Th>Category</Th>
                      <Th>Notes</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {/* Render cues as rows */}
                    {messages.map((message, index) => (
                      <Tr
                        key={index}
                        onClick={() => handleCueClick(message)}
                        style={{
                          cursor: "pointer",
                          background:
                            message.status === "live"
                              ? "red"
                              : message.status === "standby"
                              ? "orange"
                              : message.status === "completed"
                              ? "gray"
                              : "white",
                        }}
                      >
                        {/* <Td>{message.sender.name}</Td> */}
                        <Td>{message.itemNum}</Td>
                        <Td>{message.estTime}</Td>
                        <Td>{message.content}</Td>
                        <Td>{message.category}</Td>
                        <Td>{message.notes}</Td>

                        {/* Add other message attributes as needed */}
                      </Tr>
                    ))}
                    <Tr></Tr>
                  </Tbody>
                </Table>
              </Box>
            )}
            <FormControl
              onKeyDown={sendMessage}
              id="first-name"
              isRequired
              mt={3}
            >
              {istyping ? (
                <div>
                  <Lottie
                    options={defaultOptions}
                    // height={50}
                    width={70}
                    style={{ marginBottom: 15, marginLeft: 0 }}
                  />
                </div>
              ) : (
                <></>
              )}
              <Stack direction="row" spacing={4}>
                {/* // Input for updating itemNum
              <Input
                pattern="[0-9]*" // Allow only numbers
                inputMode="numeric" // Show numeric keyboard on mobile devices
                variant="filled"
                bg="#E0E0E0"
                placeholder="Enter item number.."
                value={newItemNum}
                onChange={(e) => setNewItemNum(e.target.value)}
              /> */}
                <NumberInput
                  // variant="filled"
                  bg="#E0E0E0"
                  // placeholder="Enter item number.."
                  // value={newItemNum}
                  // onChange={(e) => setNewItemNum(e.target.value)}
                  // max={999}
                  width="500px"
                  // defaultValue={0}
                >
                  <NumberInputField
                    value={newItemNum}
                    onChange={(e) => setNewItemNum(e.target.value)}
                    onBlur={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value)) {
                        setNewItemNum(value);
                      }
                    }}
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <Input
                  variant="filled"
                  bg="#E0E0E0"
                  placeholder="Cue name.."
                  value={newMessage}
                  // onChange={typingHandler}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                {/* // Input for updating estTime */}
                <Input
                  variant="filled"
                  bg="#E0E0E0"
                  placeholder="Estimated Time.."
                  value={newEstTime}
                  onChange={(e) => setNewEstTime(e.target.value)}
                />
                {/* // Input for updating category */}
                <Input
                  variant="filled"
                  bg="#E0E0E0"
                  placeholder="Category.."
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                />
                {/* // Input for updating location */}
                <Input
                  variant="filled"
                  bg="#E0E0E0"
                  placeholder="Location.."
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                />
                {/* // Input for updating notes */}
              </Stack>
              <Input
                variant="filled"
                bg="#E0E0E0"
                placeholder="Enter notes.."
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
              />
              {/* // Input for updating content
              <Input variant="filled" bg="#E0E0E0" placeholder="Enter content.." value={newContent} onChange={(e) => setNewContent(e.target.value)} /> */}
              <Button
                colorScheme="blue"
                mt={{ base: 3, md: 0 }}
                ml={{ base: 0, md: 3 }}
                onClick={addCue}
              >
                Add Cue
              </Button>{" "}
              {/* Add Cue button */}
            </FormControl>
          </Box>
        </>
      ) : (
        <Box d="flex" alignItems="center" justifyContent="center" h="100%">
          <Text fontSize="3xl" pb={3} fontFamily="Work sans">
            Click on a sheet to view cues
          </Text>
        </Box>
      )}
      {/* Render CueChangeModal */}
      <CueChangeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onUpdateStatus={handleUpdateStatus}
        onDeleteCue={handleDeleteMessage}
        onCopyCueId={handleCopyMessageId}
        selectedCue={selectedCue}
      />
    </>
  );
};

export default SingleSheet;
