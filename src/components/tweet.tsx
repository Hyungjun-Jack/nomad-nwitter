import { styled } from "styled-components";
import { ITweet } from "./timeline";
import { auth, db, storage } from "../firebase";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";

import { useState } from "react";

const Wrapper = styled.div`
  display: grid;
  gap: 10px;
  grid-template-columns: 3fr 1fr;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 15px;
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;
const Photo = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 15px;
  margin-top: auto;
`;
const Username = styled.span`
  font-weight: 600;
  font-size: 15px;
`;
const Payload = styled.p`
  margin: 10px 0px;
  font-size: 18px;
`;

const TextArea = styled.textarea`
  border: 2px solid white;
  padding: 20px;
  border-radius: 20px;
  font-size: 16px;
  color: white;
  background-color: black;
  /* width: 100%; */
  resize: none;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  &::placeholder {
    font-size: 16px;
  }
  &:focus {
    outline: none;
    border-color: #1d9bf0;
  }
`;

const ButtonWrapper = styled.div`
  display: grid;
  gap: 5px;
  grid-template-columns: 1fr 1fr 1fr 7fr;
`;

const EditButton = styled.button`
  background-color: tomato;
  color: white;
  font-weight: 600;
  border: 0;
  font-size: 12px;
  padding: 5px 10px;
  text-transform: uppercase;
  border-radius: 5px;
  cursor: pointer;
`;

const UpdateButton = styled.button`
  background-color: tomato;
  color: white;
  font-weight: 600;
  border: 0;
  font-size: 12px;
  padding: 5px 10px;
  text-transform: uppercase;
  border-radius: 5px;
  cursor: pointer;
`;

const DeleteButton = styled.button`
  background-color: tomato;
  color: white;
  font-weight: 600;
  border: 0;
  font-size: 12px;
  padding: 5px 10px;
  text-transform: uppercase;
  border-radius: 5px;
  cursor: pointer;
`;

const PhotoButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: auto;
`;

const AttachFileButton = styled.label`
  padding: 8px 0px;
  color: #1d9bf0;
  text-align: center;
  border-radius: 5px;
  border: 1px solid #1d9bf0;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  width: 130px;
`;

const AttachFileInput = styled.input`
  display: none;
`;

const _MAX_SIZE = 1 * 1024 * 1024;

export default function Tweet({ username, photo, tweet, id, userId }: ITweet) {
  const user = auth.currentUser;

  const [editState, setEditState] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [updatedTweet, setUpdatedTweet] = useState(tweet);

  const onDelete = async () => {
    const ok = confirm("Are you sure want to delete this tweet?");

    if (!ok || user?.uid !== userId) return;

    try {
      await deleteDoc(doc(db, "tweets", id));

      if (photo) {
        const photoRef = ref(storage, `tweets/${user.uid}/${id}`);
        await deleteObject(photoRef);
      }
    } catch (error) {
      console.log(error);
    } finally {
    }
  };
  const onEdit = () => {
    setEditState(true);
  };

  const onUpdate = async () => {
    const user = auth.currentUser;

    if (!user || isLoading || tweet === "" || tweet.length > 180) return;

    const docRef = doc(db, "tweets", id);

    try {
      setLoading(true);

      if (file) {
        const locationRef = ref(storage, `tweets/${user.uid}/${docRef.id}`);
        const result = await uploadBytes(locationRef, file);
        const url = await getDownloadURL(result.ref);

        await updateDoc(docRef, { tweet: updatedTweet, photo: url });
      } else {
        await updateDoc(docRef, { tweet: updatedTweet });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setEditState(false);
      setLoading(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;

    console.log(files);

    if (files && files.length === 1) {
      if (files[0].size > _MAX_SIZE) {
        alert("파일 크기는 1MB이하만 가능합니다.");
        return;
      }
      setFile(files[0]);
    }
  };

  const onChangeTweet = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUpdatedTweet(e.target.value);
  };

  return (
    <Wrapper>
      <Column>
        <Username>{username}</Username>
        {!editState && <Payload>{tweet}</Payload>}
        {editState && (
          <TextArea
            required
            rows={5}
            maxLength={180}
            value={updatedTweet}
            onChange={onChangeTweet}
          />
        )}
        {user?.uid === userId && (
          <ButtonWrapper>
            {!editState && <EditButton onClick={onEdit}>Edit</EditButton>}
            {editState && (
              <>
                <UpdateButton onClick={onUpdate}>
                  {isLoading ? "Posting..." : "Update"}
                </UpdateButton>
                <UpdateButton onClick={() => setEditState(false)}>
                  CANCEL
                </UpdateButton>
              </>
            )}
            <DeleteButton onClick={onDelete}>Delete</DeleteButton>
          </ButtonWrapper>
        )}
      </Column>
      <Column>
        {photo && <Photo src={photo} />}
        {editState && (
          <PhotoButtonWrapper>
            <AttachFileButton htmlFor={id}>
              {file ? "Photo added ✅" : "Add photo"}
            </AttachFileButton>
            <AttachFileInput
              onChange={onFileChange}
              type="file"
              id={id}
              accept="image/*"
            />
          </PhotoButtonWrapper>
        )}
      </Column>
    </Wrapper>
  );
}
