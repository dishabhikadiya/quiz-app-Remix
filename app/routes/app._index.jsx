import { useState, useEffect, useCallback } from "react";
import {
  useActionData,
  useLoaderData,
  useNavigate,
  useSubmit,
} from "@remix-run/react";
import { Button, Card, Modal, TextField } from "@shopify/polaris";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { Frame, ContextualSaveBar } from "@shopify/polaris";
import pagecss from "../quiz.css";
import prisma from "../db.server";
import { ViewMajor } from "@shopify/polaris-icons";
import { EditMajor } from "@shopify/polaris-icons";
import { DeleteMajor } from "@shopify/polaris-icons";
import { AddMajor } from "@shopify/polaris-icons";
export const links = () => [{ rel: "stylesheet", href: pagecss }];

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  const data = await prisma.quiz.findMany({
    select: {
      topicName: true,
      id: true,
      question: true,
    },
  });
  return data;
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const body = await request.formData();
  const id = body.get("id");
  if (request.method === "POST") {
    const topicname = body.get("topicname");
    const create = await prisma.quiz.create({
      data: {
        topicName: topicname,
      },
    });
    return json({ create });
  }
  if (request.method === "PUT") {
    const topicName = body.get("topicName");
    const update = await prisma.quiz.update({
      where: { id: id },
      data: {
        topicName: topicName,
      },
    });
    return json({ update });
  }
  if (request.method === "DELETE") {
    const deleteQuiz = await prisma.quiz.delete({ where: { id: id } });
  }
  return null;
};

export default function Index() {
  const nevi = useNavigate();
  const loaderData = useLoaderData();
  const [active1, setActiv1] = useState(false);
  const [active, setActiv] = useState(false);
  const [actives, setActives] = useState(false);
  const [topicName, setTopicName] = useState();
  const [topicname, setTopicname] = useState();
  const [id, setId] = useState();
  const actionData = useActionData();
  const submit = useSubmit();
  const handleChange1 = useCallback(() => setActiv1(!active1), [active1]);
  const handleChange = useCallback(() => setActiv(!active), [active]);
  const handleChange2 = useCallback(() => setActives(!actives), [actives]);
  const handleChangeText = useCallback(
    (newValue) => setTopicName(newValue),
    []
  );
  const handleChangeTextCreate = useCallback(
    (newValue) => setTopicname(newValue),
    []
  );
  const handleUpdate = () => {
    submit({ topicName, id }, { method: "PUT" });
  };
  const handleDelete = () => {
    submit({ id: id }, { method: "DELETE" });
  };
  const handleCreate = () => {
    submit({ topicname }, { method: "POST" });
  };
  useEffect(() => {
    if (actionData) {
      setActiv1(false);
      setActiv(false);
      setActives(false);
    }
  }, [actionData]);
  return (
    <div style={{ height: "250px" }}>
      <Frame>
        <ContextualSaveBar message="Quizzify" />
        <br />
        <br />
        <br />
        <br />
        <Button
          icon={AddMajor}
          variant="monochromePlain"
          onClick={() => {
            handleChange2();
          }}
        >
          Create Quiz
        </Button>
        <br />
        <br />
        {loaderData?.map((data) => [
          <Card>
            <div className="card">
              <p>{data.topicName}</p>
            </div>
            <div className="btn-1">
              <Button
                variant="tertiary"
                icon={ViewMajor}
                onClick={() => {
                  nevi(`/app/list/${data.id}`, { state: { data: data } });
                }}
              ></Button>
              <Button
                variant="tertiary"
                icon={EditMajor}
                onClick={() => {
                  handleChange();
                  setId(data.id);
                }}
              ></Button>
              <Button
                variant="tertiary"
                icon={DeleteMajor}
                onClick={() => {
                  handleChange1();
                  setId(data.id);
                }}
              ></Button>
            </div>
          </Card>,
        ])}
      </Frame>
      <Frame>
        <Modal open={active1} onClose={handleChange1} title="Delete">
          <Modal.Section>
            <p>Are you sure you want to delete this quiz ?</p>
            <br />
            <br />
            <Button variant="primary" tone="critical" onClick={handleDelete}>
              Remove
            </Button>
            &nbsp;
            <Button onClick={handleChange1}>Cancal</Button>
          </Modal.Section>
        </Modal>
      </Frame>
      <Frame>
        <Modal open={active} onClose={handleChange} title="Update Name">
          <Modal.Section>
            <TextField
              label="Quiz name"
              value={topicName}
              onChange={handleChangeText}
              autoComplete="off"
            />
            <br />
            <Button variant="primary" tone="success" onClick={handleUpdate}>
              Save
            </Button>
            &nbsp;
            <Button onClick={handleChange}>Cancal</Button>
          </Modal.Section>
        </Modal>
      </Frame>
      <Frame>
        <Modal open={actives} onClose={handleChange2} title="Create Quiz Name">
          <Modal.Section>
            <TextField
              label="Quiz name"
              value={topicname}
              onChange={handleChangeTextCreate}
              autoComplete="off"
            />
            <br />
            <Button variant="primary" tone="success" onClick={handleCreate}>
              Save
            </Button>
            &nbsp;
            <Button onClick={handleChange2}>Cancal</Button>
          </Modal.Section>
        </Modal>
      </Frame>
    </div>
  );
}
